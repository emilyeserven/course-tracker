import { pgTable, varchar } from "drizzle-orm/pg-core";

// Single-row application settings. The row is keyed by a constant id ("global")
// and created on first write via onConflictDoUpdate — there is no multi-user
// concept yet. Holds the personal Readwise Reader token used by the server-side
// proxy in src/services/readwise.ts.
export const appSettings = pgTable("app_settings", {
  id: varchar().primaryKey().default("global"),
  readwiseApiKey: varchar("readwise_api_key"),
});
