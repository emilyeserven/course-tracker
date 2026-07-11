import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

// One-time idempotent sweep of dangling routine_connections rows.
// `connected_id` has no FK (polymorphic across tasks/resources), and until now
// nothing removed a connection when its target was deleted — the rows just
// accumulated, silently filtered at read time. Delete handlers now clean up as
// they go; this purges the backlog. (The former 'topic' branch is gone with the
// Topics subsystem; migrateDropTopics deletes any remaining 'topic' rows.)
export async function migrateSweepRoutineConnectionOrphans() {
  const tableExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'routine_connections' AND table_schema = 'public'
    ) AS exists
  `);
  if (!tableExists.rows[0]?.exists) {
    return;
  }

  await db.execute(sql`
    DELETE FROM routine_connections rc
    WHERE (rc.connected_type = 'task'
           AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.id = rc.connected_id))
       OR (rc.connected_type = 'resource'
           AND NOT EXISTS (SELECT 1 FROM resources r WHERE r.id = rc.connected_id))
  `);
}
