import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

// Idempotent: add the new "curated" value to the `routine_mode` enum.
//
// Why this exists: `drizzle-kit push` does not reliably apply
// `ALTER TYPE ... ADD VALUE` non-interactively — adding an enum value makes
// push stop to prompt, which hangs/aborts in the non-TTY deploy (gateway/CI),
// the same hazard documented in migrateDropLegacyRoutineColumns. Issuing the
// `ADD VALUE IF NOT EXISTS` here (push:dev / push:prod run migrations *before*
// push) means the value already exists by the time push diffs the enum, so the
// push is a no-op for `routine_mode`.
//
// `ADD VALUE` cannot run inside a transaction block, so this is a standalone
// `db.execute` (postgres-js auto-commits a lone statement). Guards on the enum
// type existing, so it is a no-op on fresh DBs (drizzle-kit push then creates
// the type with all three values) and safe to re-run.
export async function migrateAddCuratedRoutineMode() {
  const typeExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'routine_mode'
    ) AS exists
  `);
  if (!typeExists.rows[0]?.exists) {
    return;
  }

  await db.execute(sql`ALTER TYPE routine_mode ADD VALUE IF NOT EXISTS 'curated'`);
}
