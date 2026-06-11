import { topics, topicsToResources, topicsToTags } from "@/db/schema";
import { createCreateHandler } from "@/utils/createCreateHandler";
import { syncDomainMembershipByTopic } from "@/utils/syncMembershipBlips";

import {
  buildTopicResourceLinkRows,
  buildTopicRow,
  buildTopicTagRows,
  topicBodySchema,
} from "./topicRows";

import type { TopicBody } from "./topicRows";

export default createCreateHandler<TopicBody>({
  description: "Create a new topic",
  table: topics,
  bodySchema: topicBodySchema,
  buildRow: buildTopicRow,
  junctions: [
    {
      table: topicsToTags,
      buildRows: (body, id) => buildTopicTagRows(body.tagIds, id),
    },
    {
      table: topicsToResources,
      buildRows: (body, id) => buildTopicResourceLinkRows(body.resourceLinks, id),
    },
  ],
  afterCreate: async (body, id) => {
    const uniqueDomainIds = Array.from(new Set(body.domainIds ?? []));
    if (uniqueDomainIds.length > 0) {
      await syncDomainMembershipByTopic(id, uniqueDomainIds);
    }
  },
});
