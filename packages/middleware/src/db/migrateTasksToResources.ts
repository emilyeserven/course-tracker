import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;
type ConstraintRow = { constraint_name: string } & Record<string, unknown>;

// Idempotent: convert a junction table from a composite PK to a single uuid
// `id` PK. Used for tasks_to_courses (tasks_to_resources) and
// topics_to_courses (topics_to_resources). Allows multiple rows per
// (parent, resource) pair, e.g. whole-resource + a specific module.
async function migrateJunctionToUuidPk(tableName: string) {
  const tableExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = ${tableName}
    ) AS exists
  `);
  if (!tableExists.rows[0]?.exists) return;

  const idExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = ${tableName} AND column_name = 'id'
    ) AS exists
  `);
  if (idExists.rows[0]?.exists) return;

  await db.transaction(async (tx) => {
    await tx.execute(sql`ALTER TABLE ${sql.identifier(tableName)} ADD COLUMN id VARCHAR`);
    await tx.execute(sql`UPDATE ${sql.identifier(tableName)} SET id = gen_random_uuid()::text WHERE id IS NULL`);
    await tx.execute(sql`ALTER TABLE ${sql.identifier(tableName)} ALTER COLUMN id SET NOT NULL`);

    const pkRow = await tx.execute<ConstraintRow>(sql`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = ${tableName} AND constraint_type = 'PRIMARY KEY'
    `);
    for (const row of pkRow.rows) {
      await tx.execute(
        sql`ALTER TABLE ${sql.identifier(tableName)} DROP CONSTRAINT IF EXISTS ${sql.identifier(row.constraint_name)}`,
      );
    }

    await tx.execute(sql`ALTER TABLE ${sql.identifier(tableName)} ADD PRIMARY KEY (id)`);
  });
}

export async function migrateTasksToResources() {
  await migrateJunctionToUuidPk("tasks_to_courses");
  await migrateJunctionToUuidPk("topics_to_courses");
}
