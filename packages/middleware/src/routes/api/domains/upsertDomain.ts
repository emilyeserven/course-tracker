import { domains, domainWithinScopeTopics } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { syncDomainMembershipByDomain } from "@/utils/syncMembershipBlips";

import {
  buildDomainRow,
  buildWithinScopeTopicRows,
  domainBodySchema,
  validateDomainBody,
} from "./domainRows";

import type { DomainBody } from "./domainRows";

export default createUpsertHandler<DomainBody>({
  description: "Create or update a domain",
  table: domains,
  bodySchema: domainBodySchema,
  validate: validateDomainBody,
  buildRow: buildDomainRow,
  updateableColumns: [
    "title",
    "description",
    "withinScopeDescription",
    "outOfScopeDescription",
  ],
  junctions: [
    {
      table: domainWithinScopeTopics,
      foreignKey: domainWithinScopeTopics.domainId,
      buildRows: (body, id) => buildWithinScopeTopicRows(body.withinScopeTopicIds, id),
    },
  ],
  afterUpsert: async (body, id) => {
    if (body.topicIds !== undefined) {
      await syncDomainMembershipByDomain(id, Array.from(new Set(body.topicIds)));
    }
  },
});
