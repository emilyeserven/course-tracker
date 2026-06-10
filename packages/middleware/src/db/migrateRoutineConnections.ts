import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db/index";
import { routineConnections } from "@/db/schema";

type ExistsRow = { exists: boolean } & Record<string, unknown>;
type TopicRoutineRow = { id: string;
  topic_id: string | null; } & Record<string, unknown>;
type ConnectionRow = { routine_id: string;
  connected_id: string; } & Record<string, unknown>;

// Idempotent: create the routine_connections junction (in case drizzle-kit push
// hasn't run yet) and backfill each routine's legacy `topic_id` as a connection
// of type "topic". Guards on the `topic_id` column still existing, so re-runs
// after push drops the column are no-ops. The column is left in place as a
// dormant backup until a later push removes it.
export async function migrateRoutineConnections() {
  const routinesExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'routines'
    ) AS exists
  `);
  if (!routinesExists.rows[0]?.exists) {
    return;
  }

  // Self-apply the junction table so the data copy is independent of whether
  // `drizzle-kit push` has run yet. A later push sees a matching definition and
  // is a no-op.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS routine_connections (
      id varchar PRIMARY KEY,
      routine_id varchar NOT NULL,
      connected_type varchar NOT NULL,
      connected_id varchar NOT NULL,
      position integer
    )
  `);

  const topicColumnExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'routines' AND column_name = 'topic_id'
    ) AS exists
  `);
  if (!topicColumnExists.rows[0]?.exists) {
    return;
  }

  const linked = await db.execute<TopicRoutineRow>(sql`
    SELECT id, topic_id FROM routines WHERE topic_id IS NOT NULL
  `);
  if (linked.rows.length === 0) {
    return;
  }

  // Skip routines that already carry their topic connection so re-runs don't
  // duplicate rows.
  const existing = await db.execute<ConnectionRow>(sql`
    SELECT routine_id, connected_id FROM routine_connections
    WHERE connected_type = 'topic'
  `);
  const seen = new Set(
    existing.rows.map(r => `${r.routine_id}|${r.connected_id}`),
  );

  const rows = linked.rows
    .filter(r => r.topic_id && !seen.has(`${r.id}|${r.topic_id}`))
    .map(r => ({
      id: uuidv4(),
      routineId: r.id,
      connectedType: "topic" as const,
      connectedId: r.topic_id as string,
      position: 0,
    }));

  if (rows.length > 0) {
    await db.insert(routineConnections).values(rows);
  }
}
