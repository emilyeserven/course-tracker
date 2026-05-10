import { dailies } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a daily by id",
  table: dailies,
  idColumn: dailies.id,
});
