import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { ModulesConfig, ResourceType, TaskResourceLevel } from "@emstack/types";
import { db } from "@/db";
import {
  courseProviders,
  resources,
  resourceTags,
  topicsToResources,
} from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import {
  resolveCourseProviderId,
  selfProviderError,
} from "./resourceProviderSelf";
import {
  courseStatusEnum,
  nullableBoolean,
  nullableInteger,
  nullableResourceLevelEnum,
  nullableString,
  tagIdsArraySchema,
} from "@/utils/schemas";

interface CourseBody {
  name: string;
  type?: ResourceType | null;
  description?: string | null;
  url?: string | null;
  status?: "active" | "inactive" | "complete";
  progressCurrent?: number | null;
  progressTotal?: number | null;
  cost?: string | null;
  isCostFromPlatform?: boolean;
  dateExpires?: string | null;
  isExpires?: boolean | null;
  topicId?: string | null;
  courseProviderId?: string | null;
  providerIsSelf?: boolean;
  modulesAreExhaustive?: boolean;
  easeOfStarting?: TaskResourceLevel | null;
  timeNeeded?: TaskResourceLevel | null;
  interactivity?: TaskResourceLevel | null;
  tagIds?: string[];
  modulesConfig?: ModulesConfig | null;
}

const updateableColumns = [
  "name",
  "type",
  "description",
  "url",
  "status",
  "progressCurrent",
  "progressTotal",
  "cost",
  "isCostFromPlatform",
  "dateExpires",
  "isExpires",
  "courseProviderId",
  "providerIsSelf",
  "easeOfStarting",
  "timeNeeded",
  "interactivity",
  "modulesConfig",
] as const;

export default createUpsertHandler<CourseBody>({
  description: "Create or update a resource",
  table: resources,
  validate: selfProviderError,
  bodySchema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
      },
      type: {
        type: ["string", "null"],
        enum: ["website", "book", null],
      },
      description: nullableString,
      url: nullableString,
      status: courseStatusEnum,
      progressCurrent: nullableInteger,
      progressTotal: nullableInteger,
      cost: nullableString,
      isCostFromPlatform: {
        type: "boolean",
      },
      dateExpires: nullableString,
      isExpires: nullableBoolean,
      topicId: nullableString,
      courseProviderId: nullableString,
      providerIsSelf: {
        type: "boolean",
      },
      modulesAreExhaustive: {
        type: "boolean",
      },
      easeOfStarting: nullableResourceLevelEnum,
      timeNeeded: nullableResourceLevelEnum,
      interactivity: nullableResourceLevelEnum,
      tagIds: tagIdsArraySchema,
      modulesConfig: {
        type: ["object", "null"],
        properties: {
          groupLabel: {
            type: "string",
          },
          moduleLabel: {
            type: "string",
          },
        },
      },
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    type: body.type ?? "website",
    description: body.description ?? null,
    url: body.url ?? null,
    status: body.status,
    progressCurrent: body.progressCurrent ?? null,
    progressTotal: body.progressTotal ?? null,
    cost: body.cost ?? null,
    isCostFromPlatform: body.isCostFromPlatform ?? false,
    dateExpires: body.dateExpires ?? null,
    isExpires: body.isExpires ?? null,
    courseProviderId: resolveCourseProviderId(body, id),
    providerIsSelf: body.providerIsSelf ?? false,
    modulesAreExhaustive: body.modulesAreExhaustive ?? false,
    easeOfStarting: body.easeOfStarting ?? null,
    timeNeeded: body.timeNeeded ?? null,
    interactivity: body.interactivity ?? null,
    modulesConfig: body.modulesConfig ?? null,
  }),
  updateableColumns,
  generateIdIfMissing: true,
  returnId: true,
  // Keep the self-provider in lockstep with the resource. The provider shares
  // the resource's id, so the upsert re-syncs its title (name) + location (url)
  // on every save; clearing the flag removes the auto-created provider (only a
  // self-provider can share this id, so the delete is targeted).
  afterUpsert: async (body, id) => {
    if (body.providerIsSelf && body.url) {
      await db
        .insert(courseProviders)
        .values({
          id,
          name: body.name,
          url: body.url,
        })
        .onConflictDoUpdate({
          target: courseProviders.id,
          set: {
            name: body.name,
            url: body.url,
          },
        });
    }
    else {
      await db.delete(courseProviders).where(eq(courseProviders.id, id));
    }
  },
  junctions: [
    {
      table: topicsToResources,
      foreignKey: topicsToResources.resourceId,
      buildRows: (body, id) =>
        body.topicId
          ? [{
            id: uuidv4(),
            topicId: body.topicId,
            resourceId: id,
          }]
          : [],
    },
    {
      table: resourceTags,
      foreignKey: resourceTags.resourceId,
      buildRows: (body, id) => {
        if (body.tagIds === undefined) return undefined;
        const unique = Array.from(new Set(body.tagIds));
        return unique.map((tagId, index) => ({
          resourceId: id,
          tagId,
          position: index,
        }));
      },
    },
  ],
});
