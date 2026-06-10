import { routineTemplates } from "@/db/schema";
import type { RoutineWeekly } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { weeklySchema } from "@/utils/schemas";

interface RoutineTemplateBody {
  label: string;
  weekly?: RoutineWeekly;
}

const updateableColumns = [
  "label",
  "weekly",
] as const;

export default createUpsertHandler<RoutineTemplateBody>({
  description: "Create or update a routine template",
  table: routineTemplates,
  bodySchema: {
    type: "object",
    required: ["label"],
    properties: {
      label: {
        type: "string",
      },
      weekly: weeklySchema,
    },
  },
  buildRow: (body, id) => ({
    id,
    label: body.label,
    weekly: (body.weekly ?? {}) as RoutineWeekly,
  }),
  updateableColumns,
});
