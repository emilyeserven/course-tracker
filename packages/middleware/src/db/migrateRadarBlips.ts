import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db/index";

type ExistsRow = {
  exists: boolean;
} & Record<string, unknown>;

type ColumnRow = {
  is_nullable: string;
} & Record<string, unknown>;

type BlipRow = {
  id: string;
  name: string;
} & Record<string, unknown>;

type IdRow = {
  id: string;
} & Record<string, unknown>;

// Idempotent runtime migration that converts the legacy radar_blips.name
// column into a topic_id foreign key. Existing names become topics
// (matched case-insensitively against the topics table; missing topics are
// created on the fly).
export async function migrateRadarBlips() {
  const tableExistsResult = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'radar_blips'
    ) AS exists
  `);
  if (!tableExistsResult.rows[0]?.exists) {
    return;
  }

  const nameExistsResult = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'radar_blips' AND column_name = 'name'
    ) AS exists
  `);
  const nameExists = nameExistsResult.rows[0]?.exists ?? false;
  if (!nameExists) {
    return;
  }

  await db.execute(sql`ALTER TABLE radar_blips ADD COLUMN IF NOT EXISTS topic_id varchar`);

  const blipsToMigrate = await db.execute<BlipRow>(sql`
    SELECT id, name FROM radar_blips
    WHERE name IS NOT NULL AND topic_id IS NULL
  `);

  for (const blip of blipsToMigrate.rows) {
    const trimmedName = blip.name.trim();
    if (!trimmedName) {
      continue;
    }

    const existing = await db.execute<IdRow>(sql`
      SELECT id FROM topics WHERE LOWER(name) = LOWER(${trimmedName}) LIMIT 1
    `);
    let topicId = existing.rows[0]?.id;
    if (!topicId) {
      topicId = uuidv4();
      await db.execute(sql`
        INSERT INTO topics (id, name)
        VALUES (${topicId}, ${trimmedName})
        ON CONFLICT (name) DO NOTHING
      `);
      const refetched = await db.execute<IdRow>(sql`
        SELECT id FROM topics WHERE name = ${trimmedName} LIMIT 1
      `);
      topicId = refetched.rows[0]?.id ?? topicId;
    }

    await db.execute(sql`
      UPDATE radar_blips SET topic_id = ${topicId} WHERE id = ${blip.id}
    `);
  }

  await db.execute(sql`ALTER TABLE radar_blips DROP COLUMN IF EXISTS name`);

  const topicNullable = await db.execute<ColumnRow>(sql`
    SELECT is_nullable FROM information_schema.columns
    WHERE table_name = 'radar_blips' AND column_name = 'topic_id'
  `);
  if (topicNullable.rows[0]?.is_nullable === "YES") {
    await db.execute(sql`ALTER TABLE radar_blips ALTER COLUMN topic_id SET NOT NULL`);
  }

  const fkExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'radar_blips'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'topic_id'
    ) AS exists
  `);
  if (!fkExists.rows[0]?.exists) {
    await db.execute(sql`
      ALTER TABLE radar_blips
      ADD CONSTRAINT radar_blips_topic_id_topics_id_fk
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    `);
  }
}
