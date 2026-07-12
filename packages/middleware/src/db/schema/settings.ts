import { jsonb, pgTable, varchar } from "drizzle-orm/pg-core";
import type { BookmarkClickTarget, CalendarFeed } from "@emstack/types";

// Single-row application settings. The row is keyed by a constant id ("global")
// and created on first write via onConflictDoUpdate — there is no multi-user
// concept yet. Holds the personal API tokens used by the server-side proxies in
// src/services/readwise.ts and src/services/todoist.ts.
export const appSettings = pgTable("app_settings", {
  id: varchar().primaryKey().default("global"),
  readwiseApiKey: varchar("readwise_api_key"),
  todoistApiKey: varchar("todoist_api_key"),
  // Subscribed iCal feed URLs (Google "secret address", Outlook, iCloud, …)
  // whose events feed the dashboard calendar card. The secret URL is the
  // credential, stored as plain text like the other integration tokens —
  // acceptable for this single-user, self-hosted deployment.
  googleCalendarFeeds: jsonb("google_calendar_feeds")
    .$type<CalendarFeed[]>()
    .notNull()
    .default([]),
  // Optional override for the Simple Bookmarks base URL. Null = use the
  // BOOKMARKS_API_URL env var / built-in default (see services/bookmarks.ts).
  bookmarkApiUrl: varchar("bookmark_api_url"),
  // Whether clicking a bookmark opens its underlying page or its Simple
  // Bookmarks page. Defaults to "page" (the underlying link).
  bookmarkClickTarget: varchar("bookmark_click_target")
    .$type<BookmarkClickTarget>()
    .notNull()
    .default("page"),
});
