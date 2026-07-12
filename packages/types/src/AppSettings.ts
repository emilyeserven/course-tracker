import type { BookmarkClickTarget } from "./BookmarkClickTarget";

// Response shape for GET /api/settings. Raw API tokens are never sent to the
// client — only whether each integration is configured plus a short masked hint.
export interface AppSettingsSummary {
  readwiseConfigured: boolean;
  readwiseKeyHint: string | null; // e.g. "…aB3x" (last 4 chars) or null
  todoistConfigured: boolean;
  todoistKeyHint: string | null; // e.g. "…aB3x" (last 4 chars) or null
  // Simple Bookmarks endpoint. `bookmarkApiUrl` is the stored override (null when
  // falling back to the env var / built-in default); `bookmarkApiUrlResolved` is
  // the effective base URL, sent so the client can build links into the app. The
  // endpoint is a LAN/tailscale address, not a secret, so it's returned plainly.
  bookmarkApiUrl: string | null;
  bookmarkApiUrlResolved: string;
  // Whether clicking a bookmark opens its underlying page or its Simple Bookmarks
  // page.
  bookmarkClickTarget: BookmarkClickTarget;
}

// Request body for PUT /api/settings. Only the keys present in the body are
// updated; a null or empty value clears that key.
export interface AppSettingsUpdate {
  readwiseApiKey?: string | null;
  todoistApiKey?: string | null;
  bookmarkApiUrl?: string | null;
  bookmarkClickTarget?: BookmarkClickTarget;
}
