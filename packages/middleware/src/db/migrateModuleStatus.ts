import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

// Idempotent: replace the legacy boolean `modules.is_complete` with the
// three-state `modules.status` enum ("unstarted" | "in_progress" | "complete").
//
// Why this exists: modules gained a tri-state status. `drizzle-kit push` can't
// create the new pgEnum type and ALTER the column non-interactively without
// prompting, and the moment a column is added while `is_complete` still exists,
// push sees add+drop in one table and can't tell it from a rename — which
// hangs/aborts in the non-TTY deploy (the hazard documented in
// migrateDropLegacyRoutineColumns). Creating the enum, adding `status`,
// backfilling, and dropping `is_complete` here (migrations run *before* push)
// leaves push with a purely no-op diff for the modules table.
//
// Guards on the `modules` table and the `is_complete` column existing, so it is
// a no-op on fresh DBs (push then creates the final shape) and safe to re-run.
export async function migrateModuleStatus() {
  const modulesExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'modules' AND table_schema = 'public'
    ) AS exists
  `);
  if (!modulesExists.rows[0]?.exists) {
    return;
  }

  // Create the enum type if it doesn't exist yet (push would otherwise prompt).
  const typeExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'module_status'
    ) AS exists
  `);
  if (!typeExists.rows[0]?.exists) {
    await db.execute(sql`
      CREATE TYPE module_status AS ENUM ('unstarted', 'in_progress', 'complete')
    `);
  }

  // Add the new column (defaults every existing row to 'unstarted').
  await db.execute(sql`
    ALTER TABLE modules
    ADD COLUMN IF NOT EXISTS status module_status NOT NULL DEFAULT 'unstarted'
  `);

  // Backfill from the legacy boolean only while it still exists. There is no
  // source for 'in_progress'; completed modules map to 'complete', the rest
  // keep the 'unstarted' default.
  const isCompleteExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'modules' AND column_name = 'is_complete' AND table_schema = 'public'
    ) AS exists
  `);
  if (isCompleteExists.rows[0]?.exists) {
    await db.execute(sql`
      UPDATE modules SET status = 'complete' WHERE is_complete = true
    `);
    await db.execute(sql`ALTER TABLE modules DROP COLUMN IF EXISTS is_complete`);
    console.log("Migrated `modules.is_complete` -> `modules.status`");
  }
}
