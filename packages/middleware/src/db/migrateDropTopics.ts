import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

// Idempotent runtime migration dropping the removed Topics subsystem: the
// `topics`, `topics_to_courses` (topic↔resource), and `topics_to_tags` tables,
// the `tasks.topic_id` column, and any leftover `'topic'` routine connections
// (polymorphic, no FK). Early-returns on a fresh DB or once dropped — nothing to
// clean when `topics` never existed. Runs before `drizzle-kit push` so push
// never sees these to prompt an interactive (deploy-hanging) drop.
export async function migrateDropTopics() {
  const topicsExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'topics' AND table_schema = 'public'
    ) AS exists
  `);
  if (!topicsExists.rows[0]?.exists) {
    return;
  }

  // Purge routine connections that pointed at a topic (no FK to cascade).
  await db.execute(sql`DELETE FROM routine_connections WHERE connected_type = 'topic'`);
  // Junctions first (their FKs reference topics), then the table, then the
  // plain (FK-less) tasks column.
  await db.execute(sql`DROP TABLE IF EXISTS topics_to_courses`);
  await db.execute(sql`DROP TABLE IF EXISTS topics_to_tags`);
  await db.execute(sql`DROP TABLE IF EXISTS topics`);
  await db.execute(sql`ALTER TABLE tasks DROP COLUMN IF EXISTS topic_id`);
}
