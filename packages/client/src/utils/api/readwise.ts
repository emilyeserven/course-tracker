import type { ReadwiseReadingList } from "@emstack/types";

import { fetchJson, postJson } from "./client";

export function fetchReadwiseReadingList(): Promise<ReadwiseReadingList> {
  return fetchJson<ReadwiseReadingList>("/api/readwise/reading-list");
}

export function saveReadwiseArticle(input: {
  url: string;
  title?: string;
}): Promise<{ status: string;
  id: string; }> {
  return postJson(
    "/api/readwise/save",
    input,
    "Failed to save to Readwise",
  );
}
