import {
  topics,
  topicsToResources,
  topicsToTags,
} from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a topic by ID",
  table: topics,
  idColumn: topics.id,
  routineConnectionType: "topic",
  junctions: [
    {
      table: topicsToResources,
      foreignKey: topicsToResources.topicId,
    },
    {
      table: topicsToTags,
      foreignKey: topicsToTags.topicId,
    },
  ],
});
