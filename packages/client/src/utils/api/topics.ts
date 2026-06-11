import type { Topic, TopicForTopicsPage } from "@emstack/types";

import { createEntityClient, postJson } from "./client";

export const topicsApi = createEntityClient<Topic, TopicForTopicsPage[]>(
  "topics",
  "topic",
);

export const fetchTopics = topicsApi.list;
export const fetchSingleTopic = topicsApi.get;
export const upsertTopic = topicsApi.upsert;
export const createTopic = topicsApi.create;
export const deleteSingleTopic = topicsApi.delete;

export async function bulkDeleteTopics(
  ids: string[],
): Promise<{ status: string;
  count: number; }> {
  return postJson(
    "/api/topics/bulk-delete",
    {
      ids,
    },
    "Failed to delete topics",
  );
}
