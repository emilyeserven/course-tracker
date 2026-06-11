import { domains, domainWithinScopeTopics } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { nullableString } from "@/utils/schemas";
import { syncDomainMembershipByDomain } from "@/utils/syncMembershipBlips";

interface DomainBody {
  title: string;
  description?: string | null;
  withinScopeDescription?: string | null;
  outOfScopeDescription?: string | null;
  topicIds?: string[];
  withinScopeTopicIds?: string[];
}

export default createUpsertHandler<DomainBody>({
  description: "Create or update a domain",
  table: domains,
  bodySchema: {
    type: "object",
    required: ["title"],
    properties: {
      title: {
        type: "string",
        minLength: 1,
      },
      description: nullableString,
      withinScopeDescription: nullableString,
      outOfScopeDescription: nullableString,
      topicIds: {
        type: "array",
        items: {
          type: "string",
        },
      },
      withinScopeTopicIds: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  },
  validate: body => (body.title.trim() ? null : "Title is required"),
  buildRow: (body, id) => ({
    id,
    title: body.title.trim(),
    description: body.description ?? null,
    withinScopeDescription: body.withinScopeDescription ?? null,
    outOfScopeDescription: body.outOfScopeDescription ?? null,
  }),
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
      buildRows: (body, id) => {
        if (body.withinScopeTopicIds === undefined) return undefined;
        return Array.from(new Set(body.withinScopeTopicIds)).map(topicId => ({
          topicId,
          domainId: id,
        }));
      },
    },
  ],
  afterUpsert: async (body, id) => {
    if (body.topicIds !== undefined) {
      await syncDomainMembershipByDomain(id, Array.from(new Set(body.topicIds)));
    }
  },
});
