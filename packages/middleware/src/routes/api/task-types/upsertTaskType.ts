import { taskTypes } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { nullableString, tagsArraySchema } from "@/utils/schemas";

interface TaskTypeBody {
  name: string;
  whenToUse?: string | null;
  tags?: string[];
}

const updateableColumns = ["name", "whenToUse", "tags"] as const;

export default createUpsertHandler<TaskTypeBody>({
  description: "Create or update a task type",
  table: taskTypes,
  bodySchema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
      },
      whenToUse: nullableString,
      tags: tagsArraySchema,
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    whenToUse: body.whenToUse ?? null,
    tags: body.tags ?? [],
  }),
  updateableColumns,
});
