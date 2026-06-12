import type { ReadwiseReadingList } from "@emstack/types";

import { fetchJson } from "./client";

export function fetchReadwiseReadingList(): Promise<ReadwiseReadingList> {
  return fetchJson<ReadwiseReadingList>("/api/readwise/reading-list");
}
