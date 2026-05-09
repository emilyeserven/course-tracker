import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

// Idempotent: backfill modules.length from modules.minutes_length where the
// new column is null. Skipped on a fresh DB where neither column exists yet.
export async function migrateModuleLength() {
  const lengthExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'modules' AND column_name = 'length'
    ) AS exists
  `);
  const minutesExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'modules' AND column_name = 'minutes_length'
    ) AS exists
  `);
  if (!lengthExists.rows[0]?.exists || !minutesExists.rows[0]?.exists) {
    return;
  }
  await db.execute(sql`
    UPDATE modules
    SET length = minutes_length::text
    WHERE length IS NULL AND minutes_length IS NOT NULL
  `);
}
