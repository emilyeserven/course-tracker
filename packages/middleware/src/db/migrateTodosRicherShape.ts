import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

async function tableExists(name: string): Promise<boolean> {
  const res = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = ${name} AND table_schema = 'public'
    ) AS exists
  `);
  return Boolean(res.rows[0]?.exists);
}

// Idempotent: evolve `task_todos` from a plain checklist (name + is_complete
// boolean) into a Curated-Routine-entry-like item — a 5-state `status`, a
// `due_date`, and `note`/`location`. Also adds `tasks.due_date`.
//
// Why this exists (not just drizzle-kit push): push can't create the
// `dailyCompletionStatus` pgEnum type and ALTER the column non-interactively;
// and adding `status` while `is_complete` still exists makes push see add+drop
// on one table and prompt for a rename (the hazard documented in
// migrateDropLegacyRoutineColumns). So we create the type, add every new column,
// backfill, and drop `is_complete` here (migrations run *before* push), leaving
// push a no-op.
//
// (This migration once also folded the deprecated task-level resources
// (task_resources, tasks_to_courses) into per-todo resource links; that step was
// removed with the Resource subsystem — migrateDropResources drops those tables
// and the todos' resource columns.)
//
// Guards on `task_todos` existing, so it is a no-op on a fresh DB (push then
// creates the final shape) and safe to re-run.
export async function migrateTodosRicherShape() {
  if (!(await tableExists("task_todos"))) {
    return;
  }

  // 1. Create the status enum type if absent (push would otherwise prompt). The
  //    type name matches the pgEnum declaration in schema/enums.ts.
  const typeExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'dailyCompletionStatus'
    ) AS exists
  `);
  if (!typeExists.rows[0]?.exists) {
    await db.execute(sql`
      CREATE TYPE "dailyCompletionStatus" AS ENUM ('incomplete', 'touched', 'goal', 'exceeded', 'freeze')
    `);
  }

  // 2. Add every new column up front so push later sees a no-op diff.
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS status "dailyCompletionStatus" NOT NULL DEFAULT 'incomplete'`);
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS due_date date`);
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS note varchar`);
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS location varchar`);
  await db.execute(sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date date`);

  // 3. Backfill status from the legacy boolean while it still exists, then drop
  //    it (so push sees no add+drop pair on task_todos).
  const isCompleteExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'task_todos' AND column_name = 'is_complete' AND table_schema = 'public'
    ) AS exists
  `);
  if (isCompleteExists.rows[0]?.exists) {
    await db.execute(sql`
      UPDATE task_todos SET status = 'goal' WHERE is_complete = true
    `);
    await db.execute(sql`ALTER TABLE task_todos DROP COLUMN IF EXISTS is_complete`);
    console.log("Migrated `task_todos.is_complete` -> `task_todos.status`");
  }
}
