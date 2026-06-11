import { tagGroups, tags } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a tag group by ID (only if it has no tags)",
  table: tagGroups,
  idColumn: tagGroups.id,
  guard: {
    table: tags,
    column: tags.groupId,
    message: count =>
      `Cannot delete tag group: ${count} tag${count === 1 ? "" : "s"} still belong to it`,
  },
});
