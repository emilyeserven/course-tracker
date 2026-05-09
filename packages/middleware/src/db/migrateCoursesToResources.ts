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

// `task_id` only existed on the legacy task-resources table. Its presence on a
// `resources` table is the signature that the rename never landed (or only
// landed partially) and the table currently sitting under the `resources`
// name is the legacy task-resources data, not the new top-level Resource.
async function resourcesIsLegacyTaskResources(): Promise<boolean> {
  return (await tableExists("resources")) && (await columnExists("resources", "task_id"));
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
//
// Two failure modes from before this migration shipped need to be handled:
//   1. Pristine pre-rename state: `courses` exists, legacy `resources`
//      exists. Rename both.
//   2. Partial-failure state seen in prod: a previous drizzle-kit push
//      dropped `courses` (data loss) but never renamed legacy `resources`
//      out of the way. The new top-level `resources` doesn't exist; the
//      table sitting at `resources` is still the legacy task-resources
//      shape, and junction tables hold orphan `resource_id` values that
//      used to point to the now-gone courses. Move legacy aside so
//      drizzle-kit can create a fresh `resources`, then drop the orphans
//      before drizzle-kit installs the FKs.
export async function migrateCoursesToResources() {
  const coursesExists = await tableExists("courses");
  const legacyShape = await resourcesIsLegacyTaskResources();

  if (coursesExists || legacyShape) {
    await db.transaction(async (tx) => {
      if (coursesExists) {
        // Drop every FK that targets `courses.id`. Constraint names are
        // looked up by reference so we don't depend on drizzle's
        // auto-naming staying stable across versions.
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
      }

      // Move the legacy task-resources table out of the way so the
      // `resources` name is free for either the rename of `courses` (case 1)
      // or for drizzle-kit to create a fresh `resources` (case 2).
      if (legacyShape && !(await tableExists("task_resources"))) {
        await tx.execute(sql`ALTER TABLE resources RENAME TO task_resources`);
      }

      if (coursesExists) {
        await tx.execute(sql`ALTER TABLE courses RENAME TO resources`);
      }
    });
  }

  // Rename `course_id` → `resource_id` on the surviving reference tables.
  // Keep these out of the rename transaction so a partial failure here
  // doesn't undo the table rename.
  for (const table of ["topics_to_courses", "tasks_to_courses", "dailies"] as const) {
    if ((await tableExists(table)) && (await columnExists(table, "course_id"))) {
      await db.execute(
        sql`ALTER TABLE ${sql.identifier(table)} RENAME COLUMN course_id TO resource_id`,
      );
    }
  }

  // Clean up orphan `resource_id` values on the junction tables before
  // drizzle-kit push tries to install
  // `topics_to_courses_resource_id_resources_id_fk` etc. In the prod
  // partial-failure state these point to courses that drizzle-kit dropped
  // earlier, so they can't be salvaged.
  await cleanupOrphanResourceRefs();
}

async function cleanupOrphanResourceRefs() {
  // After the renames above, either:
  //   - `resources` holds the renamed courses (orphan filter: rows whose
  //     resource_id is not in resources)
  //   - `resources` does not exist yet (drizzle-kit will create it next);
  //     every existing resource_id is orphan
  const resourcesExists = await tableExists("resources");

  for (const table of ["topics_to_courses", "tasks_to_courses"] as const) {
    if (!(await tableExists(table))) continue;
    if (!(await columnExists(table, "resource_id"))) continue;

    if (resourcesExists) {
      await db.execute(sql`
        DELETE FROM ${sql.identifier(table)}
        WHERE resource_id NOT IN (SELECT id FROM resources)
      `);
    }
    else {
      await db.execute(sql`DELETE FROM ${sql.identifier(table)}`);
    }
  }

  if ((await tableExists("dailies")) && (await columnExists("dailies", "resource_id"))) {
    if (resourcesExists) {
      await db.execute(sql`
        UPDATE dailies SET resource_id = NULL
        WHERE resource_id IS NOT NULL
          AND resource_id NOT IN (SELECT id FROM resources)
      `);
    }
    else {
      await db.execute(sql`UPDATE dailies SET resource_id = NULL WHERE resource_id IS NOT NULL`);
    }
  }
}
