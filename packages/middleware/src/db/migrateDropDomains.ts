import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

// Idempotent runtime migration that drops the Domains/radar subsystem: the
// `radar_blips`, `domain_within_scope_topics`, and `domains` tables plus the
// `app_settings.focused_domain_ids` column. The feature was removed entirely, so
// there is nothing to preserve. `IF EXISTS` makes it a no-op on a fresh DB or
// once dropped. Runs before `drizzle-kit push` so push never sees these tables
// to prompt an interactive (deploy-hanging) drop. Drop order respects the FKs:
// the two junctions reference `domains`, so they go first.
export async function migrateDropDomains() {
  await db.execute(sql`DROP TABLE IF EXISTS radar_blips`);
  await db.execute(sql`DROP TABLE IF EXISTS domain_within_scope_topics`);
  await db.execute(sql`DROP TABLE IF EXISTS domains`);

  // `app_settings` may not exist yet on a brand-new DB (push creates it after
  // migrations run), so guard the column drop on the table's existence.
  const settingsExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'app_settings' AND table_schema = 'public'
    ) AS exists
  `);
  if (settingsExists.rows[0]?.exists) {
    await db.execute(
      sql`ALTER TABLE app_settings DROP COLUMN IF EXISTS focused_domain_ids`,
    );
  }
}
