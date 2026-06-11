import { nullableString } from "../../../utils/schemas.ts";

// Body schema and row builders shared by the domain create and upsert
// handlers.

export interface DomainBody {
  title: string;
  description?: string | null;
  withinScopeDescription?: string | null;
  outOfScopeDescription?: string | null;
  topicIds?: string[];
  withinScopeTopicIds?: string[];
}

export const domainBodySchema = {
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
} as const;

export function validateDomainBody(body: DomainBody) {
  return body.title.trim() ? null : "Title is required";
}

export function buildDomainRow(body: DomainBody, id: string) {
  return {
    id,
    title: body.title.trim(),
    description: body.description ?? null,
    withinScopeDescription: body.withinScopeDescription ?? null,
    outOfScopeDescription: body.outOfScopeDescription ?? null,
  };
}

export function buildWithinScopeTopicRows(
  withinScopeTopicIds: readonly string[] | undefined,
  domainId: string,
) {
  if (withinScopeTopicIds === undefined) return undefined;
  return Array.from(new Set(withinScopeTopicIds)).map(topicId => ({
    topicId,
    domainId,
  }));
}
