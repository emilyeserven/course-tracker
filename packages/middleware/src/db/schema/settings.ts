import { pgTable, varchar } from "drizzle-orm/pg-core";

// Single-row application settings. The row is keyed by a constant id ("global")
// and created on first write via onConflictDoUpdate — there is no multi-user
// concept yet. Holds the personal API tokens used by the server-side proxies in
// src/services/readwise.ts and src/services/todoist.ts.
export const appSettings = pgTable("app_settings", {
  id: varchar().primaryKey().default("global"),
  readwiseApiKey: varchar("readwise_api_key"),
  todoistApiKey: varchar("todoist_api_key"),
});
