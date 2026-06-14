import type { TaskResourceLevel } from "@emstack/types";
import { modules, moduleTags } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { coerceModuleLength } from "@/utils/moduleLength";
import {
  moduleStatusEnum,
  nullableInteger,
  nullableResourceLevelEnum,
  nullableString,
  tagIdsArraySchema,
} from "@/utils/schemas";

interface ModuleBody {
  name: string;
  resourceId: string;
  moduleGroupId?: string | null;
  description?: string | null;
  url?: string | null;
  length?: string | null;
  /** @deprecated kept for backwards compat; coerced into `length` */
  minutesLength?: number | null;
  status?: "unstarted" | "in_progress" | "complete";
  position?: number | null;
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
  "moduleGroupId",
  "description",
  "url",
  "length",
  "status",
  "position",
  "pageStart",
  "pageEnd",
  "easeOfStarting",
  "timeNeeded",
  "interactivity",
] as const;

export default createUpsertHandler<ModuleBody>({
  description: "Create or update a module",
  table: modules,
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
      moduleGroupId: nullableString,
      description: nullableString,
      url: nullableString,
      length: nullableString,
      minutesLength: nullableInteger,
      status: moduleStatusEnum,
      position: nullableInteger,
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
    moduleGroupId: body.moduleGroupId ?? null,
    name: body.name,
    description: body.description ?? null,
    url: body.url ?? null,
    length: coerceModuleLength(body.length, body.minutesLength),
    status: body.status ?? "unstarted",
    position: body.position ?? null,
    pageStart: body.pageStart ?? null,
    pageEnd: body.pageEnd ?? null,
    easeOfStarting: body.easeOfStarting ?? null,
    timeNeeded: body.timeNeeded ?? null,
    interactivity: body.interactivity ?? null,
  }),
  updateableColumns,
  // Partial merge: only write columns the request actually carries, so a save
  // or status toggle that omits a field never resets it. `position` is owned by
  // the reorder flow — clobbering it to null sorts the module to the list end.
  buildSetClause: (body, row) => {
    const provided: Record<string, boolean> = {
      name: body.name !== undefined,
      resourceId: body.resourceId !== undefined,
      moduleGroupId: body.moduleGroupId !== undefined,
      description: body.description !== undefined,
      url: body.url !== undefined,
      // `length` is derived from either `length` or the deprecated `minutesLength`.
      length: body.length !== undefined || body.minutesLength !== undefined,
      status: body.status !== undefined,
      position: body.position !== undefined,
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
      table: moduleTags,
      foreignKey: moduleTags.moduleId,
      buildRows: (body, id) => {
        if (body.tagIds === undefined) return undefined;
        const unique = Array.from(new Set(body.tagIds));
        return unique.map((tagId, index) => ({
          moduleId: id,
          tagId,
          position: index,
        }));
      },
    },
  ],
});
