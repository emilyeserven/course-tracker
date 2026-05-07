import { topics, topicsToCourses } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a topic by ID",
  table: topics,
  idColumn: topics.id,
  junction: {
    table: topicsToCourses,
    foreignKey: topicsToCourses.topicId,
  },
});
