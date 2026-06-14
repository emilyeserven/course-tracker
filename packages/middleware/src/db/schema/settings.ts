import { jsonb, pgTable, varchar } from "drizzle-orm/pg-core";
import type { CalendarFeed, HintTemplate } from "@emstack/types";

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
  // Ordered ids of the domains the user has marked "Focused". Capped at 3 by the
  // update handler; ordering drives the focused tabs in the dashboard's
  // "Explore Something" card.
  focusedDomainIds: jsonb("focused_domain_ids")
    .$type<string[]>()
    .notNull()
    .default([]),
  // Reusable hint templates for naming a resource's group/module hierarchy. Each
  // resource references one by id (resources.modules_config.hintTemplateId); its
  // hints surface as placeholders when editing that resource's groups/modules.
  moduleHintTemplates: jsonb("module_hint_templates")
    .$type<HintTemplate[]>()
    .notNull()
    .default([]),
});
