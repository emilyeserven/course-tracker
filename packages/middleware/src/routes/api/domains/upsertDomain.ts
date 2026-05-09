import {
  domainExcludedTopics,
  domains,
  domainWithinScopeTopics,
  topicsToDomains,
} from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { nullableBoolean, nullableString } from "@/utils/schemas";

interface DomainBody {
  title: string;
  description?: string | null;
  hasRadar?: boolean | null;
  withinScopeDescription?: string | null;
  outOfScopeDescription?: string | null;
  topicIds?: string[];
  excludedTopics?: { topicId: string;
    reason?: string | null; }[];
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
      hasRadar: nullableBoolean,
      withinScopeDescription: nullableString,
      outOfScopeDescription: nullableString,
      topicIds: {
        type: "array",
        items: {
          type: "string",
        },
      },
      excludedTopics: {
        type: "array",
        items: {
          type: "object",
          required: ["topicId"],
          properties: {
            topicId: {
              type: "string",
            },
            reason: nullableString,
          },
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
  validate: (body) => {
    if (!body.title.trim()) {
      return "Title is required";
    }
    return null;
  },
  buildRow: (body, id) => ({
    id,
    title: body.title.trim(),
    description: body.description ?? null,
    hasRadar: body.hasRadar ?? null,
    withinScopeDescription: body.withinScopeDescription ?? null,
    outOfScopeDescription: body.outOfScopeDescription ?? null,
  }),
  updateableColumns: [
    "title",
    "description",
    "hasRadar",
    "withinScopeDescription",
    "outOfScopeDescription",
  ],
  junctions: [
    {
      table: topicsToDomains,
      foreignKey: topicsToDomains.domainId,
      buildRows: (body, id) => {
        if (body.topicIds === undefined) {
          return undefined;
        }
        return body.topicIds.map(topicId => ({
          topicId,
          domainId: id,
        }));
      },
    },
    {
      table: domainExcludedTopics,
      foreignKey: domainExcludedTopics.domainId,
      buildRows: (body, id) => {
        if (body.excludedTopics === undefined) {
          return undefined;
        }
        const dedup = new Map<string, string | null>();
        for (const entry of body.excludedTopics) {
          if (!dedup.has(entry.topicId)) {
            dedup.set(entry.topicId, entry.reason ?? null);
          }
        }
        return Array.from(dedup.entries()).map(([topicId, reason]) => ({
          topicId,
          domainId: id,
          reason,
        }));
      },
    },
    {
      table: domainWithinScopeTopics,
      foreignKey: domainWithinScopeTopics.domainId,
      buildRows: (body, id) => {
        if (body.withinScopeTopicIds === undefined) {
          return undefined;
        }
        return Array.from(new Set(body.withinScopeTopicIds)).map(topicId => ({
          topicId,
          domainId: id,
        }));
      },
    },
  ],
});
