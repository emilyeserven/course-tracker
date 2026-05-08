import {
  domainExcludedTopics,
  radarBlips,
  topics,
  topicsToCourses,
  topicsToDomains,
} from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a topic by ID",
  table: topics,
  idColumn: topics.id,
  junctions: [
    {
      table: radarBlips,
      foreignKey: radarBlips.topicId,
    },
    {
      table: topicsToCourses,
      foreignKey: topicsToCourses.topicId,
    },
    {
      table: topicsToDomains,
      foreignKey: topicsToDomains.topicId,
    },
    {
      table: domainExcludedTopics,
      foreignKey: domainExcludedTopics.topicId,
    },
  ],
});
