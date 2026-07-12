import type { BookmarkClickTarget } from "@emstack/types";

// The minimal identity a bookmark link needs, normalized across the different
// association shapes (TaskBookmark.bookmarkId, RoutineConnection.id,
// RoutineReferenceItem.id all map to `externalId`).
export interface BookmarkLinkable {
  externalId: string;
  url: string | null;
}

// The browser URL for a bookmark's own page in the Simple Bookmarks app, or null
// when the app URL or the bookmark id is unknown (so callers fall back to the
// underlying link or render plain text).
export function buildBookmarkPageUrl(
  externalId: string,
  apiUrl: string | null,
): string | null {
  if (!apiUrl || !externalId) {
    return null;
  }
  return `${apiUrl.replace(/\/+$/, "")}/bookmarks/${encodeURIComponent(externalId)}`;
}

// Resolve where clicking a bookmark should go, honoring the app-wide preference:
// "bookmark" opens its Simple Bookmarks page (falling back to the underlying url
// if the app URL is unknown); "page" opens the underlying url (falling back to
// the bookmark page). Returns null when neither is available.
export function resolveBookmarkHref(
  {
    externalId, url,
  }: BookmarkLinkable,
  clickTarget: BookmarkClickTarget,
  apiUrl: string | null,
): string | null {
  const pageUrl = buildBookmarkPageUrl(externalId, apiUrl);
  return clickTarget === "bookmark" ? pageUrl ?? url : url ?? pageUrl;
}
