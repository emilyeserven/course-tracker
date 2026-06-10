import { routineTemplates } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a routine template by ID",
  table: routineTemplates,
  idColumn: routineTemplates.id,
});
