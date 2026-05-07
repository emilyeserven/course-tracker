import { courseProviders } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a provider by ID",
  table: courseProviders,
  idColumn: courseProviders.id,
});
