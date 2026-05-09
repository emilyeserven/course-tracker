import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;
type ConstraintRow = {
  constraint_name: string;
  table_name?: string;
} & Record<string, unknown>;

async function tableExists(name: string): Promise<boolean> {
  const result = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = ${name} AND table_schema = 'public'
    ) AS exists
  `);
  return result.rows[0]?.exists ?? false;
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const result = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = ${table} AND column_name = ${column}
    ) AS exists
  `);
  return result.rows[0]?.exists ?? false;
}

// Idempotent runtime migration that lands the table renames introduced when
// the Resource concept replaced Course:
//   - `courses` → `resources`
//   - the legacy `resources` task-resources table → `task_resources`
//   - `topics_to_courses.course_id` → `resource_id`
//   - `dailies.course_id` → `resource_id`
//
// Drizzle-kit can't infer a rename from a snapshot diff — it would drop+create
// (data loss) and emit DROP CONSTRAINT statements against legacy FK names
// that fail at apply time (e.g. `topics_to_courses_course_id_courses_id_fk`).
// Pre-applying the moves here gives drizzle-kit a clean diff.
export async function migrateCoursesToResources() {
  if (!(await tableExists("courses"))) return;

  await db.transaction(async (tx) => {
    // Drop every FK that targets `courses.id`. Constraint names are looked
    // up by reference so we don't depend on drizzle's auto-naming staying
    // stable across versions.
    const fksTargetingCourses = await tx.execute<ConstraintRow>(sql`
      SELECT tc.constraint_name, tc.table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
       AND tc.table_schema = ccu.table_schema
      WHERE ccu.table_name = 'courses'
        AND tc.constraint_type = 'FOREIGN KEY'
    `);
    for (const row of fksTargetingCourses.rows) {
      await tx.execute(
        sql`ALTER TABLE ${sql.identifier(row.table_name as string)} DROP CONSTRAINT IF EXISTS ${sql.identifier(row.constraint_name)}`,
      );
    }

    // Move the legacy task-resources table out of the way first so the
    // `resources` name is free for the rename of `courses`.
    const legacyResourcesTableExists = await tableExists("resources");
    if (legacyResourcesTableExists && !(await tableExists("task_resources"))) {
      await tx.execute(sql`ALTER TABLE resources RENAME TO task_resources`);
    }

    await tx.execute(sql`ALTER TABLE courses RENAME TO resources`);
  });

  // Rename `course_id` → `resource_id` on the surviving reference tables.
  // Keep these out of the rename transaction so a partial failure here
  // doesn't undo the table rename.
  for (const table of ["topics_to_courses", "dailies"] as const) {
    if ((await tableExists(table)) && (await columnExists(table, "course_id"))) {
      await db.execute(
        sql`ALTER TABLE ${sql.identifier(table)} RENAME COLUMN course_id TO resource_id`,
      );
    }
  }
}
