import { db } from "@/db/index";
import { resources } from "@/db/schema";
import { migrateAddCuratedRoutineMode } from "./migrateAddCuratedRoutineMode.ts";
import { migrateDropDailies } from "./migrateDropDailies.ts";
import { migrateDropDomains } from "./migrateDropDomains.ts";
import { migrateDropTopics } from "./migrateDropTopics.ts";
import { migrateDropLegacyRoutineColumns } from "./migrateDropLegacyRoutineColumns.ts";
import { migrateModuleStatus } from "./migrateModuleStatus.ts";
import { migrateSweepRoutineConnectionOrphans } from "./migrateSweepRoutineConnectionOrphans.ts";
import { migrateTodosRicherShape } from "./migrateTodosRicherShape.ts";
import { seed } from "./seed.ts";

// Runtime migrations run on every server start and must be idempotent (see
// CLAUDE.md). There is a single, fully controlled prod DB, so migrations that
// have run there get pruned from this list (and their files deleted) instead
// of accumulating forever. Previously completed: courses → resources rename,
// radar blip consolidation, module length backfill, tasks_to_courses uuid PK,
// dailies → routines copy, routine topic_id → connections, routine location →
// weekly entries.
export async function runMigrations() {
  // Add the "curated" value to the routine_mode enum before drizzle-kit push
  // diffs it (push can't apply ALTER TYPE ADD VALUE non-interactively). Runs
  // first so the enum value exists for any later routine writes/migrations.
  try {
    await migrateAddCuratedRoutineMode();
  }
  catch (err) {
    console.error("Failed to add curated routine mode enum value:", err);
    throw err;
  }

  // Drop the legacy `dailies` table. Guarded: keeps the table (with a loud
  // error) if it still has rows that were never copied into `routines`.
  try {
    await migrateDropDailies();
  }
  catch (err) {
    console.error("Failed to drop legacy dailies table:", err);
    throw err;
  }

  // Drop the removed Domains/radar subsystem (tables + focused_domain_ids
  // column) before push diffs the schema, which no longer defines them.
  try {
    await migrateDropDomains();
  }
  catch (err) {
    console.error("Failed to drop domains/radar tables:", err);
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

  // Drop the removed Topics subsystem (tables + tasks.topic_id + 'topic'
  // connections) before push diffs the schema, which no longer defines them.
  // After the sweep / legacy-column backfill so it cleans up any 'topic' rows
  // those produce.
  try {
    await migrateDropTopics();
  }
  catch (err) {
    console.error("Failed to drop topics tables:", err);
    throw err;
  }

  // Replace the legacy boolean `modules.is_complete` with the tri-state
  // `modules.status` enum, creating the type + dropping the old column before
  // drizzle-kit push diffs the modules table (push can't do either
  // non-interactively). Independent of the routine migrations above.
  try {
    await migrateModuleStatus();
  }
  catch (err) {
    console.error("Failed to migrate module status:", err);
    throw err;
  }

  // Evolve task_todos into Curated-entry-like items (status enum + due date +
  // single resource link) and fold the deprecated task-level resources into
  // todos. Creates the dailyCompletionStatus enum + drops the old is_complete
  // boolean before drizzle-kit push diffs task_todos (push can't do either
  // non-interactively). Independent of the migrations above.
  try {
    await migrateTodosRicherShape();
  }
  catch (err) {
    console.error("Failed to migrate todos to richer shape:", err);
    throw err;
  }
}

export async function seedIfEmpty() {
  const currentResources = await db.select().from(resources);
  if (currentResources.length === 0) {
    await seed();
  }
}
