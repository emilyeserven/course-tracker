import { dailyCriteriaTemplates } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";

interface DailyCriteriaTemplateBody {
  label: string;
  incomplete?: string;
  touched?: string;
  goal?: string;
  exceeded?: string;
  freeze?: string;
}

const updateableColumns = [
  "label",
  "incomplete",
  "touched",
  "goal",
  "exceeded",
  "freeze",
] as const;

export default createUpsertHandler<DailyCriteriaTemplateBody>({
  description: "Create or update a daily criteria template",
  table: dailyCriteriaTemplates,
  bodySchema: {
    type: "object",
    required: ["label"],
    properties: {
      label: {
        type: "string",
      },
      incomplete: {
        type: "string",
      },
      touched: {
        type: "string",
      },
      goal: {
        type: "string",
      },
      exceeded: {
        type: "string",
      },
      freeze: {
        type: "string",
      },
    },
  },
  buildRow: (body, id) => ({
    id,
    label: body.label,
    incomplete: body.incomplete ?? "",
    touched: body.touched ?? "",
    goal: body.goal ?? "",
    exceeded: body.exceeded ?? "",
    freeze: body.freeze ?? "",
  }),
  updateableColumns,
});
