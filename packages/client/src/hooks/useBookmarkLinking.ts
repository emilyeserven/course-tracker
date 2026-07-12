import type { BookmarkLinkable } from "@/components/bookmarks/bookmarkLinks";

import { useContext, useMemo } from "react";

import { BookmarkLinkingContext } from "@/components/bookmarks/bookmarkLinkingContext";
import {
  buildBookmarkPageUrl,
  resolveBookmarkHref,

} from "@/components/bookmarks/bookmarkLinks";

// Read the current bookmark-linking preference and get href builders for a
// bookmark. `resolveHref` follows the app-wide preference; `bookmarkPageUrl` is
// always the Simple Bookmarks page (or null when the endpoint is unknown).
export function useBookmarkLinking() {
  const {
    clickTarget, apiUrl,
  } = useContext(BookmarkLinkingContext);

  return useMemo(
    () => ({
      clickTarget,
      resolveHref: (linkable: BookmarkLinkable) =>
        resolveBookmarkHref(linkable, clickTarget, apiUrl),
      bookmarkPageUrl: (linkable: BookmarkLinkable) =>
        buildBookmarkPageUrl(linkable.externalId, apiUrl),
    }),
    [clickTarget, apiUrl],
  );
}
