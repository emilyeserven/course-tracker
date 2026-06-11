import { topics, topicsToResources, topicsToTags } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import {
  nullableString,
  resourceLinksArraySchema,
  tagIdsArraySchema,
} from "@/utils/schemas";
import { syncDomainMembershipByTopic } from "@/utils/syncMembershipBlips";

import {
  buildTopicResourceLinkRows,
  buildTopicRow,
  buildTopicTagRows,
} from "./topicRows";

import type { TopicBodyFields, TopicResourceLinkInput } from "./topicRows";

interface TopicBody extends TopicBodyFields {
  domainIds?: string[];
  tagIds?: string[];
  resourceLinks?: TopicResourceLinkInput[];
}

export default createUpsertHandler<TopicBody>({
  description: "Update a topic",
  table: topics,
  bodySchema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        minLength: 1,
      },
      description: nullableString,
      reason: nullableString,
      domainIds: {
        type: "array",
        items: {
          type: "string",
        },
      },
      tagIds: tagIdsArraySchema,
      resourceLinks: resourceLinksArraySchema,
    },
  },
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
