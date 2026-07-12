import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

// Idempotent runtime migration dropping the removed Resource/Provider/Module/
// Interaction subsystem in one shot: the `resources`, `courseProviders`,
// `module_groups`, `modules`, and `interactions` tables; the resource↔task/tag
// junctions (`tasks_to_courses`, `task_resources`, `resource_tags`,
// `module_group_tags`, `module_tags`); the resource-link columns on `task_todos`;
// the `app_settings.module_hint_templates` column; any leftover `'resource'`
// routine connections (polymorphic, no FK); and the now-unused resource/module/
// interaction enum types. Early-returns on a fresh DB or once dropped — nothing
// to clean when `resources` never existed. Runs before `drizzle-kit push` so push
// never sees these to prompt an interactive (deploy-hanging) drop.
export async function migrateDropResources() {
  const resourcesExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'resources' AND table_schema = 'public'
    ) AS exists
  `);
  if (!resourcesExists.rows[0]?.exists) {
    return;
  }

  // Purge routine connections that pointed at a resource (no FK to cascade).
  await db.execute(sql`DELETE FROM routine_connections WHERE connected_type = 'resource'`);

  // Drop the resource-link columns on the surviving task_todos table first so
  // their FKs into resources/modules are gone before the tables are dropped.
  await db.execute(sql`ALTER TABLE task_todos DROP COLUMN IF EXISTS resource_id`);
  await db.execute(sql`ALTER TABLE task_todos DROP COLUMN IF EXISTS module_group_id`);
  await db.execute(sql`ALTER TABLE task_todos DROP COLUMN IF EXISTS module_id`);

  // Drop the module-naming hint templates column on the singleton settings row.
  await db.execute(sql`ALTER TABLE app_settings DROP COLUMN IF EXISTS module_hint_templates`);

  // Drop the tables. CASCADE clears any FK constraints from tables that reference
  // them (all of which are themselves being dropped here) regardless of order.
  await db.execute(sql`DROP TABLE IF EXISTS tasks_to_courses CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS task_resources CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS resource_tags CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS module_group_tags CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS module_tags CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS interactions CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS modules CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS module_groups CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS resources CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "courseProviders" CASCADE`);

  // Drop the now-unused enum types (no surviving table uses them; `status`,
  // `dailyCompletionStatus`, and `routine_mode` are deliberately kept).
  await db.execute(sql`DROP TYPE IF EXISTS "resourceType"`);
  await db.execute(sql`DROP TYPE IF EXISTS "resourceLevel"`);
  await db.execute(sql`DROP TYPE IF EXISTS "module_status"`);
  await db.execute(sql`DROP TYPE IF EXISTS "interaction_progress"`);
  await db.execute(sql`DROP TYPE IF EXISTS "interaction_difficulty"`);
  await db.execute(sql`DROP TYPE IF EXISTS "interaction_understanding"`);
  await db.execute(sql`DROP TYPE IF EXISTS "recurPeriodUnit"`);
}
