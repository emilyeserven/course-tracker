import { jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

// Single-row application settings. The row is keyed by a constant id ("global")
// and created on first write via onConflictDoUpdate — there is no multi-user
// concept yet. Holds the personal API tokens used by the server-side proxies in
// src/services/readwise.ts and src/services/todoist.ts.
export const appSettings = pgTable("app_settings", {
  id: varchar().primaryKey().default("global"),
  readwiseApiKey: varchar("readwise_api_key"),
  todoistApiKey: varchar("todoist_api_key"),
  // Google Calendar OAuth: the access token is short-lived and transparently
  // refreshed (on a 401) from the long-lived refresh token; the email labels the
  // connected account in Settings; the ids pick which calendars feed the card.
  // Stored as plain text like the other integration tokens — acceptable for this
  // single-user, self-hosted deployment.
  googleAccessToken: varchar("google_access_token"),
  googleRefreshToken: varchar("google_refresh_token"),
  googleAccountEmail: varchar("google_account_email"),
  googleSelectedCalendarIds: jsonb("google_selected_calendar_ids")
    .$type<string[]>()
    .notNull()
    .default([]),
  // Ordered ids of the domains the user has marked "Focused". Capped at 3 by the
  // update handler; ordering drives the focused tabs in the dashboard's
  // "Explore Something" card.
  focusedDomainIds: jsonb("focused_domain_ids")
    .$type<string[]>()
    .notNull()
    .default([]),
});
