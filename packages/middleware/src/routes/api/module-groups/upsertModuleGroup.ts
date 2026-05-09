import { moduleGroups, moduleGroupTags } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import {
  nullableInteger,
  nullableResourceLevelEnum,
  nullableString,
  tagIdsArraySchema,
} from "@/utils/schemas";

interface ModuleGroupBody {
  name: string;
  resourceId: string;
  description?: string | null;
  url?: string | null;
  position?: number | null;
  totalCount?: number | null;
  completedCount?: number | null;
  easeOfStarting?: "low" | "medium" | "high" | null;
  timeNeeded?: "low" | "medium" | "high" | null;
  interactivity?: "low" | "medium" | "high" | null;
  tagIds?: string[];
}

const updateableColumns = [
  "name",
  "resourceId",
  "description",
  "url",
  "position",
  "totalCount",
  "completedCount",
  "easeOfStarting",
  "timeNeeded",
  "interactivity",
] as const;

export default createUpsertHandler<ModuleGroupBody>({
  description: "Create or update a module group",
  table: moduleGroups,
  bodySchema: {
    type: "object",
    required: ["name", "resourceId"],
    properties: {
      name: {
        type: "string",
        minLength: 1,
      },
      resourceId: {
        type: "string",
        minLength: 1,
      },
      description: nullableString,
      url: nullableString,
      position: nullableInteger,
      totalCount: nullableInteger,
      completedCount: nullableInteger,
      easeOfStarting: nullableResourceLevelEnum,
      timeNeeded: nullableResourceLevelEnum,
      interactivity: nullableResourceLevelEnum,
      tagIds: tagIdsArraySchema,
    },
  },
  buildRow: (body, id) => ({
    id,
    resourceId: body.resourceId,
    name: body.name,
    description: body.description ?? null,
    url: body.url ?? null,
    position: body.position ?? null,
    totalCount: body.totalCount ?? null,
    completedCount: body.completedCount ?? null,
    easeOfStarting: body.easeOfStarting ?? null,
    timeNeeded: body.timeNeeded ?? null,
    interactivity: body.interactivity ?? null,
  }),
  updateableColumns,
  junctions: [
    {
      table: moduleGroupTags,
      foreignKey: moduleGroupTags.moduleGroupId,
      buildRows: (body, id) => {
        if (body.tagIds === undefined) return undefined;
        const unique = Array.from(new Set(body.tagIds));
        return unique.map((tagId, index) => ({
          moduleGroupId: id,
          tagId,
          position: index,
        }));
      },
    },
  ],
});
