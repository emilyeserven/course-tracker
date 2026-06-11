import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

// Idempotent runtime migration that drops the legacy `dailies` table. Dailies
// were collapsed into daily-mode routines (the old migrateDailiesToRoutines
// copied every row, same ids); the table has only been a dormant backup since.
export async function migrateDropDailies() {
  // Skip on a fresh DB (or once the drop has landed) — nothing to do.
  const dailiesExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'dailies' AND table_schema = 'public'
    ) AS exists
  `);
  if (!dailiesExists.rows[0]?.exists) {
    return;
  }

  // Safety guard: only drop once every daily has a matching routine row. If
  // the copy never ran (a DB that predates dailies → routines), keep the table
  // and shout — dropping it here would lose data.
  const unmigratedExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM dailies d
      WHERE NOT EXISTS (SELECT 1 FROM routines r WHERE r.id = d.id)
    ) AS exists
  `);
  if (unmigratedExists.rows[0]?.exists) {
    console.error(
      "Skipping dailies drop: `dailies` has rows with no matching `routines` row. "
      + "This DB predates the dailies → routines copy (removed from runMigrations); "
      + "copy the rows over manually before dropping the table.",
    );
    return;
  }

  await db.execute(sql`DROP TABLE dailies`);
  console.log("Dropped legacy `dailies` table (dailies live on as daily-mode routines)");
}
