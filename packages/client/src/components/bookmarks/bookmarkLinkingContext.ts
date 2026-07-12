import type { BookmarkClickTarget } from "@emstack/types";

import { createContext } from "react";

export interface BookmarkLinkingValue {
  clickTarget: BookmarkClickTarget;
  // Effective Simple Bookmarks base URL, or null when unknown (settings not
  // loaded / no endpoint), in which case bookmark-page links can't be built.
  apiUrl: string | null;
}

// Defaults for components rendered outside a provider (stories, tests): behave
// exactly like the pre-setting app — open the underlying page, no app deep-link.
export const BookmarkLinkingContext = createContext<BookmarkLinkingValue>({
  clickTarget: "page",
  apiUrl: null,
});
