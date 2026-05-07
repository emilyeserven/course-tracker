import { domains, topicsToDomains } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a domain by ID",
  table: domains,
  idColumn: domains.id,
  junction: {
    table: topicsToDomains,
    foreignKey: topicsToDomains.domainId,
  },
});
