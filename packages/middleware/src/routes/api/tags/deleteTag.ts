import {
  moduleGroupTags,
  moduleTags,
  resourceTags,
  tags,
  tasksToTags,
  topicsToTags,
} from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a tag by ID (also removes it from all entities)",
  table: tags,
  idColumn: tags.id,
  junctions: [
    {
      table: tasksToTags,
      foreignKey: tasksToTags.tagId,
    },
    {
      table: topicsToTags,
      foreignKey: topicsToTags.tagId,
    },
    {
      table: resourceTags,
      foreignKey: resourceTags.tagId,
    },
    {
      table: moduleGroupTags,
      foreignKey: moduleGroupTags.tagId,
    },
    {
      table: moduleTags,
      foreignKey: moduleTags.tagId,
    },
  ],
});
