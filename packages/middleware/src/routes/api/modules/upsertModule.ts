import { modules } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { nullableInteger, nullableString } from "@/utils/schemas";

interface ModuleBody {
  name: string;
  courseId: string;
  moduleGroupId?: string | null;
  description?: string | null;
  url?: string | null;
  minutesLength?: number | null;
  isComplete?: boolean;
  position?: number | null;
}

const updateableColumns = [
  "name",
  "courseId",
  "moduleGroupId",
  "description",
  "url",
  "minutesLength",
  "isComplete",
  "position",
] as const;

export default createUpsertHandler<ModuleBody>({
  description: "Create or update a module",
  table: modules,
  bodySchema: {
    type: "object",
    required: ["name", "courseId"],
    properties: {
      name: {
        type: "string",
        minLength: 1,
      },
      courseId: {
        type: "string",
        minLength: 1,
      },
      moduleGroupId: nullableString,
      description: nullableString,
      url: nullableString,
      minutesLength: nullableInteger,
      isComplete: {
        type: "boolean",
      },
      position: nullableInteger,
    },
  },
  buildRow: (body, id) => ({
    id,
    courseId: body.courseId,
    moduleGroupId: body.moduleGroupId ?? null,
    name: body.name,
    description: body.description ?? null,
    url: body.url ?? null,
    minutesLength: body.minutesLength ?? null,
    isComplete: body.isComplete ?? false,
    position: body.position ?? null,
  }),
  updateableColumns,
});
