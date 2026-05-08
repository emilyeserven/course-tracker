import { topics, topicsToDomains } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { nullableString } from "@/utils/schemas";

interface TopicBody {
  name: string;
  description?: string | null;
  reason?: string | null;
  domainIds?: string[];
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
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    description: body.description ?? null,
    reason: body.reason ?? null,
  }),
  updateableColumns: ["name", "description", "reason"],
  junctions: [
    {
      table: topicsToDomains,
      foreignKey: topicsToDomains.topicId,
      buildRows: (body, id) => {
        if (body.domainIds === undefined) {
          return undefined;
        }
        const uniqueDomainIds = Array.from(new Set(body.domainIds));
        return uniqueDomainIds.map(domainId => ({
          topicId: id,
          domainId,
        }));
      },
    },
  ],
});
