import { modules, moduleTags } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { coerceModuleLength } from "@/utils/moduleLength";
import {
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
  isComplete?: boolean;
  position?: number | null;
  easeOfStarting?: "low" | "medium" | "high" | null;
  timeNeeded?: "low" | "medium" | "high" | null;
  interactivity?: "low" | "medium" | "high" | null;
  tagIds?: string[];
}

const updateableColumns = [
  "name",
  "resourceId",
  "moduleGroupId",
  "description",
  "url",
  "length",
  "isComplete",
  "position",
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
      isComplete: {
        type: "boolean",
      },
      position: nullableInteger,
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
    isComplete: body.isComplete ?? false,
    position: body.position ?? null,
    easeOfStarting: body.easeOfStarting ?? null,
    timeNeeded: body.timeNeeded ?? null,
    interactivity: body.interactivity ?? null,
  }),
  updateableColumns,
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
