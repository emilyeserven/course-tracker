import {
  domainExcludedTopics,
  domains,
  domainWithinScopeTopics,
  radarBlips,
  radarQuadrants,
  radarRings,
  topicsToDomains,
} from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a domain by ID",
  table: domains,
  idColumn: domains.id,
  junctions: [
    {
      table: radarBlips,
      foreignKey: radarBlips.domainId,
    },
    {
      table: radarQuadrants,
      foreignKey: radarQuadrants.domainId,
    },
    {
      table: radarRings,
      foreignKey: radarRings.domainId,
    },
    {
      table: topicsToDomains,
      foreignKey: topicsToDomains.domainId,
    },
    {
      table: domainExcludedTopics,
      foreignKey: domainExcludedTopics.domainId,
    },
    {
      table: domainWithinScopeTopics,
      foreignKey: domainWithinScopeTopics.domainId,
    },
  ],
});
