import { v4 as uuidv4 } from "uuid";
import { resources, resourceTags, topicsToResources } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
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
  modulesAreExhaustive?: boolean;
  easeOfStarting?: "low" | "medium" | "high" | null;
  timeNeeded?: "low" | "medium" | "high" | null;
  interactivity?: "low" | "medium" | "high" | null;
  tagIds?: string[];
}

const updateableColumns = [
  "name",
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
  "modulesAreExhaustive",
  "easeOfStarting",
  "timeNeeded",
  "interactivity",
] as const;

export default createUpsertHandler<CourseBody>({
  description: "Create or update a course",
  table: resources,
  bodySchema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
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
      modulesAreExhaustive: {
        type: "boolean",
      },
      easeOfStarting: nullableResourceLevelEnum,
      timeNeeded: nullableResourceLevelEnum,
      interactivity: nullableResourceLevelEnum,
      tagIds: tagIdsArraySchema,
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    description: body.description ?? null,
    url: body.url ?? null,
    status: body.status,
    progressCurrent: body.progressCurrent ?? null,
    progressTotal: body.progressTotal ?? null,
    cost: body.cost ?? null,
    isCostFromPlatform: body.isCostFromPlatform ?? false,
    dateExpires: body.dateExpires ?? null,
    isExpires: body.isExpires ?? null,
    courseProviderId: body.courseProviderId ?? null,
    modulesAreExhaustive: body.modulesAreExhaustive ?? false,
    easeOfStarting: body.easeOfStarting ?? null,
    timeNeeded: body.timeNeeded ?? null,
    interactivity: body.interactivity ?? null,
  }),
  updateableColumns,
  generateIdIfMissing: true,
  returnId: true,
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
