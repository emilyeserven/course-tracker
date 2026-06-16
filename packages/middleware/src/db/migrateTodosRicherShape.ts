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
// `due_date`, `note`/`location`, and a single optional resource link
// (resource_id + module_group_id + module_id) — and fold the deprecated
// task-level resources (task_resources, tasks_to_courses) into one-resource-per
// todo. Also adds `tasks.due_date`.
//
// Why this exists (not just drizzle-kit push):
//   1. push can't create the `dailyCompletionStatus` pgEnum type and ALTER the
//      column non-interactively; and adding `status` while `is_complete` still
//      exists makes push see add+drop on one table and prompt for a rename
//      (the hazard documented in migrateModuleStatus / migrateDropLegacyRoutineColumns).
//      So we create the type, add every new column, backfill, and drop
//      `is_complete` here (migrations run *before* push), leaving push a no-op.
//   2. Moving rows between tables is data movement push never performs.
//
// Guards on `task_todos` existing, so it is a no-op on a fresh DB (push then
// creates the final shape) and safe to re-run.
// TODO(taskresource-followup): once this has shipped to prod, delete this file
// and drop the task_resources / tasks_to_courses tables.
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

  // 2. Add every new column up front so the data move below can populate them
  //    and push later sees a no-op diff.
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS status "dailyCompletionStatus" NOT NULL DEFAULT 'incomplete'`);
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS due_date date`);
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS note varchar`);
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS location varchar`);
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS resource_id varchar`);
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS module_group_id varchar`);
  await db.execute(sql`ALTER TABLE task_todos ADD COLUMN IF NOT EXISTS module_id varchar`);
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

  // 4. Fold deprecated task-level resources into one-resource-per-todo. Stable
  //    ids (`migrated-tr-…` / `migrated-ttc-…`) + ON CONFLICT DO NOTHING make
  //    re-runs idempotent. Positions start at 1000+ so migrated rows land after
  //    any existing todos.
  if (await tableExists("task_resources")) {
    await db.execute(sql`
      INSERT INTO task_todos (id, task_id, name, status, url, position, resource_id, module_group_id, module_id)
      SELECT
        'migrated-tr-' || tr.id,
        tr.task_id,
        tr.name,
        CASE WHEN tr.used_yet THEN 'goal'::"dailyCompletionStatus" ELSE 'incomplete'::"dailyCompletionStatus" END,
        tr.url,
        1000 + (row_number() OVER (PARTITION BY tr.task_id ORDER BY tr.position NULLS LAST, tr.id))::int,
        tr.resource_id,
        tr.module_group_id,
        tr.module_id
      FROM task_resources tr
      ON CONFLICT (id) DO NOTHING
    `);
    console.log("Folded `task_resources` rows into `task_todos`");
  }

  if (await tableExists("tasks_to_courses")) {
    await db.execute(sql`
      INSERT INTO task_todos (id, task_id, name, status, position, resource_id, module_group_id, module_id)
      SELECT
        'migrated-ttc-' || ttc.id,
        ttc.task_id,
        COALESCE(r.name, 'Resource'),
        'incomplete'::"dailyCompletionStatus",
        2000 + (row_number() OVER (PARTITION BY ttc.task_id ORDER BY ttc.position NULLS LAST, ttc.id))::int,
        ttc.resource_id,
        ttc.module_group_id,
        ttc.module_id
      FROM tasks_to_courses ttc
      LEFT JOIN resources r ON r.id = ttc.resource_id
      ON CONFLICT (id) DO NOTHING
    `);
    console.log("Folded `tasks_to_courses` rows into `task_todos`");
  }
}
