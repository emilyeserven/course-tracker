import { domains, domainWithinScopeTopics } from "@/db/schema";
import { createCreateHandler } from "@/utils/createCreateHandler";
import { syncDomainMembershipByDomain } from "@/utils/syncMembershipBlips";

import {
  buildDomainRow,
  buildWithinScopeTopicRows,
  domainBodySchema,
  validateDomainBody,
} from "./domainRows";

import type { DomainBody } from "./domainRows";

export default createCreateHandler<DomainBody>({
  description: "Create a new domain",
  table: domains,
  bodySchema: domainBodySchema,
  validate: validateDomainBody,
  buildRow: buildDomainRow,
  junctions: [
    {
      table: domainWithinScopeTopics,
      buildRows: (body, id) => buildWithinScopeTopicRows(body.withinScopeTopicIds, id),
    },
  ],
  afterCreate: async (body, id) => {
    const uniqueTopicIds = Array.from(new Set(body.topicIds ?? []));
    if (uniqueTopicIds.length > 0) {
      await syncDomainMembershipByDomain(id, uniqueTopicIds);
    }
  },
});
