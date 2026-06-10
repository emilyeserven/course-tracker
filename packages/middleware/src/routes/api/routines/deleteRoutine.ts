import { routines } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a routine by id",
  table: routines,
  idColumn: routines.id,
});
