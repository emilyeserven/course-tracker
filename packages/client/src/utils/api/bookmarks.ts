import type { BookmarkSummary } from "@emstack/types";

import { fetchJson, postJson } from "./client";

// Client for the middleware bookmark proxy (see middleware routes/api/bookmarks).
// These front the companion Simple Bookmarks app; the browser only ever talks
// to same-origin /api/bookmarks/*.

export function searchBookmarks(query: string): Promise<BookmarkSummary[]> {
  return fetchJson<BookmarkSummary[]>(
    `/api/bookmarks/search?q=${encodeURIComponent(query)}`,
  );
}

export function resolveBookmark(
  url: string,
): Promise<{ bookmark: BookmarkSummary | null }> {
  return fetchJson<{ bookmark: BookmarkSummary | null }>(
    `/api/bookmarks/resolve?url=${encodeURIComponent(url)}`,
  );
}

export function createBookmark(input: {
  url: string;
  title?: string;
}): Promise<BookmarkSummary> {
  return postJson<BookmarkSummary>(
    "/api/bookmarks",
    input,
    "Failed to create bookmark",
  );
}
