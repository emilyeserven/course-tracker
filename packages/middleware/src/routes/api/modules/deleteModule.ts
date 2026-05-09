import { modules } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a module by ID",
  table: modules,
  idColumn: modules.id,
});
