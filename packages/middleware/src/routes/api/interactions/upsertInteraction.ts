import type { Interaction } from "@emstack/types";
import { interactions } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { interactionBodySchema } from "@/utils/schemas";

type InteractionBody = Omit<Interaction, "id">;

const updateableColumns = [
  "resourceId",
  "moduleGroupId",
  "moduleId",
  "date",
  "progress",
  "note",
  "difficulty",
  "understanding",
] as const;

export default createUpsertHandler<InteractionBody>({
  description: "Create or update an interaction",
  table: interactions,
  bodySchema: interactionBodySchema,
  buildRow: (body, id) => ({
    id,
    resourceId: body.resourceId,
    moduleGroupId: body.moduleGroupId ?? null,
    moduleId: body.moduleId ?? null,
    date: body.date,
    progress: body.progress,
    note: body.note ?? null,
    difficulty: body.difficulty ?? null,
    understanding: body.understanding ?? null,
  }),
  updateableColumns,
});
