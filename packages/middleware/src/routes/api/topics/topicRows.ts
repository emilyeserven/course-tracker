import { v4 as uuidv4 } from "uuid";

// Pure row builders shared by the topic create and upsert handlers. Junction
// builders return `undefined` when their input is absent (= leave existing
// rows untouched) and `[]` to clear.

export interface TopicBodyFields {
  name: string;
  description?: string | null;
  reason?: string | null;
}

export interface TopicResourceLinkInput {
  resourceId: string;
  moduleGroupId?: string | null;
  moduleId?: string | null;
}

export function buildTopicRow(body: TopicBodyFields, id: string) {
  return {
    id,
    name: body.name,
    description: body.description ?? null,
    reason: body.reason ?? null,
  };
}

export function buildTopicTagRows(
  tagIds: readonly string[] | undefined,
  topicId: string,
) {
  if (tagIds === undefined) return undefined;
  return Array.from(new Set(tagIds)).map((tagId, index) => ({
    topicId,
    tagId,
    position: index,
  }));
}

export function buildTopicResourceLinkRows(
  resourceLinks: readonly TopicResourceLinkInput[] | undefined,
  topicId: string,
  makeId: () => string = uuidv4,
) {
  if (resourceLinks === undefined) return undefined;
  // Dedupe by the full (resourceId, moduleGroupId, moduleId) tuple so a topic
  // can hold multiple sub-target rows per resource.
  const seen = new Set<string>();
  const rows: {
    id: string;
    topicId: string;
    resourceId: string;
    moduleGroupId: string | null;
    moduleId: string | null;
  }[] = [];
  for (const link of resourceLinks) {
    const key = `${link.resourceId}|${link.moduleGroupId ?? ""}|${link.moduleId ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      id: makeId(),
      topicId,
      resourceId: link.resourceId,
      moduleGroupId: link.moduleGroupId ?? null,
      moduleId: link.moduleId ?? null,
    });
  }
  return rows;
}
