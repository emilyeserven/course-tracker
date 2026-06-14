import type { TaskResourceLevel } from "@emstack/types";
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
  pageStart?: number | null;
  pageEnd?: number | null;
  easeOfStarting?: TaskResourceLevel | null;
  timeNeeded?: TaskResourceLevel | null;
  interactivity?: TaskResourceLevel | null;
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
  "pageStart",
  "pageEnd",
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
      pageStart: nullableInteger,
      pageEnd: nullableInteger,
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
    pageStart: body.pageStart ?? null,
    pageEnd: body.pageEnd ?? null,
    easeOfStarting: body.easeOfStarting ?? null,
    timeNeeded: body.timeNeeded ?? null,
    interactivity: body.interactivity ?? null,
  }),
  updateableColumns,
  // Partial merge: only write columns the request actually carries, so a save
  // that omits a field never resets it. `position` is owned by the reorder flow
  // — clobbering it to null sorts the group to the end of the list.
  buildSetClause: (body, row) => {
    const provided: Record<string, boolean> = {
      name: body.name !== undefined,
      resourceId: body.resourceId !== undefined,
      description: body.description !== undefined,
      url: body.url !== undefined,
      position: body.position !== undefined,
      totalCount: body.totalCount !== undefined,
      completedCount: body.completedCount !== undefined,
      pageStart: body.pageStart !== undefined,
      pageEnd: body.pageEnd !== undefined,
      easeOfStarting: body.easeOfStarting !== undefined,
      timeNeeded: body.timeNeeded !== undefined,
      interactivity: body.interactivity !== undefined,
    };
    const set: Record<string, unknown> = {};
    for (const col of updateableColumns) {
      if (provided[col]) set[col] = row[col];
    }
    return set;
  },
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
