import {
  domainExcludedTopics,
  domainWithinScopeTopics,
  radarBlips,
  topics,
  topicsToCourses,
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
      table: domainExcludedTopics,
      foreignKey: domainExcludedTopics.topicId,
    },
    {
      table: domainWithinScopeTopics,
      foreignKey: domainWithinScopeTopics.topicId,
    },
  ],
});
