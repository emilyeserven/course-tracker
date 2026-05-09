import { interactions } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete an interaction by ID",
  table: interactions,
  idColumn: interactions.id,
});
