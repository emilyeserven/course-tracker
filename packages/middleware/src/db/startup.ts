import { db } from "@/db/index";
import { resources } from "@/db/schema";
import { migrateDropDailies } from "./migrateDropDailies.ts";
import { migrateDropLegacyRoutineColumns } from "./migrateDropLegacyRoutineColumns.ts";
import { migrateSweepRoutineConnectionOrphans } from "./migrateSweepRoutineConnectionOrphans.ts";
import { seed } from "./seed.ts";

// Runtime migrations run on every server start and must be idempotent (see
// CLAUDE.md). There is a single, fully controlled prod DB, so migrations that
// have run there get pruned from this list (and their files deleted) instead
// of accumulating forever. Previously completed: courses → resources rename,
// radar blip consolidation, module length backfill, tasks_to_courses uuid PK,
// dailies → routines copy, routine topic_id → connections, routine location →
// weekly entries.
export async function runMigrations() {
  // Drop the legacy `dailies` table. Guarded: keeps the table (with a loud
  // error) if it still has rows that were never copied into `routines`.
  try {
    await migrateDropDailies();
  }
  catch (err) {
    console.error("Failed to drop legacy dailies table:", err);
    throw err;
  }

  // Drop the legacy `routines.topic_id` / `routines.location` columns (backfilled
  // into routine_connections / weekly entries by now-pruned migrations, but left
  // in place). Must run before drizzle-kit push: while they linger, adding any
  // new routines column makes push see add+drop in one table and prompt for a
  // rename, which hangs in the non-TTY deploy. Runs before the orphan sweep so a
  // backfilled topic link to a deleted topic gets cleaned up.
  try {
    await migrateDropLegacyRoutineColumns();
  }
  catch (err) {
    console.error("Failed to drop legacy routine columns:", err);
    throw err;
  }

  // Purge dangling routine_connections rows left behind before delete
  // handlers started cleaning them up.
  try {
    await migrateSweepRoutineConnectionOrphans();
  }
  catch (err) {
    console.error("Failed to sweep dangling routine connections:", err);
    throw err;
  }
}

export async function seedIfEmpty() {
  const currentResources = await db.select().from(resources);
  if (currentResources.length === 0) {
    await seed();
  }
}
