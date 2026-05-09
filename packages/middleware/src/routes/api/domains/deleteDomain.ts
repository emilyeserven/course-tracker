import {
  domainExcludedTopics,
  domains,
  domainWithinScopeTopics,
  radarBlips,
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
      table: domainExcludedTopics,
      foreignKey: domainExcludedTopics.domainId,
    },
    {
      table: domainWithinScopeTopics,
      foreignKey: domainWithinScopeTopics.domainId,
    },
  ],
});
