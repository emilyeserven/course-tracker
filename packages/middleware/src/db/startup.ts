import { db } from "@/db/index";
import { resources } from "@/db/schema";
import { migrateDropDailies } from "./migrateDropDailies.ts";
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
