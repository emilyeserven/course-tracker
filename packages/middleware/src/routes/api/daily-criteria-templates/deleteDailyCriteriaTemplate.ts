import { dailyCriteriaTemplates } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a daily criteria template by ID",
  table: dailyCriteriaTemplates,
  idColumn: dailyCriteriaTemplates.id,
});
