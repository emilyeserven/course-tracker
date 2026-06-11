import { topics, topicsToResources, topicsToTags } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { syncDomainMembershipByTopic } from "@/utils/syncMembershipBlips";

import {
  buildTopicResourceLinkRows,
  buildTopicRow,
  buildTopicTagRows,
  topicBodySchema,
} from "./topicRows";

import type { TopicBody } from "./topicRows";

export default createUpsertHandler<TopicBody>({
  description: "Update a topic",
  table: topics,
  bodySchema: topicBodySchema,
  buildRow: buildTopicRow,
  updateableColumns: ["name", "description", "reason"],
  junctions: [
    {
      table: topicsToTags,
      foreignKey: topicsToTags.topicId,
      buildRows: (body, id) => buildTopicTagRows(body.tagIds, id),
    },
    {
      table: topicsToResources,
      foreignKey: topicsToResources.topicId,
      buildRows: (body, id) => buildTopicResourceLinkRows(body.resourceLinks, id),
    },
  ],
  afterUpsert: async (body, id) => {
    if (body.domainIds !== undefined) {
      await syncDomainMembershipByTopic(id, Array.from(new Set(body.domainIds)));
    }
  },
});
