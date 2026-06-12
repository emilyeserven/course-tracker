import { eq, sql } from "drizzle-orm";

import { db } from "@/db/index";
import { routines } from "@/db/schema";

import type { RoutineWeekly } from "@emstack/types";

type ExistsRow = { exists: boolean } & Record<string, unknown>;
type RoutineLocationRow = {
  id: string;
  location: string | null;
  weekly: RoutineWeekly | null;
} & Record<string, unknown>;

// Idempotent: remove the two legacy `routines` columns (`topic_id`, `location`)
// that earlier migrations backfilled elsewhere but left in place.
//
// Why this exists: the old migrateRoutineConnections copied each routine's
// `topic_id` into a `routine_connections` row but deferred dropping the column
// to "a later push"; migrateRoutineLocationToWeekly folded `location` into the
// weekly grid and dropped it, but was pruned. On any DB where those drops never
// landed, the columns linger — and the moment a new column is added to
// `routines` (e.g. `weekly_target`), `drizzle-kit push` sees one column added
// and these dropped in the same table, can't tell add+drop from a rename, and
// stops to prompt — which hangs/aborts in the non-TTY deploy (gateway/CI).
// Doing the cleanup here keeps the subsequent push diff purely additive.
//
// Guards on each column still existing, so this is a no-op on fresh DBs (the
// columns never existed) and after the drops have landed.
export async function migrateDropLegacyRoutineColumns() {
  const routinesExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'routines' AND table_schema = 'public'
    ) AS exists
  `);
  if (!routinesExists.rows[0]?.exists) {
    return;
  }

  // --- topic_id -> routine_connections ---
  const topicColumnExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'routines' AND column_name = 'topic_id' AND table_schema = 'public'
    ) AS exists
  `);
  if (topicColumnExists.rows[0]?.exists) {
    // The junction normally exists already (prior push/migration); create it
    // defensively so the backfill never fails on an odd intermediate state.
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS routine_connections (
        id varchar PRIMARY KEY,
        routine_id varchar NOT NULL,
        connected_type varchar NOT NULL,
        connected_id varchar NOT NULL,
        position integer
      )
    `);

    // Backfill each routine's legacy topic link as a "topic" connection,
    // skipping any that already have one so re-runs don't duplicate rows.
    await db.execute(sql`
      INSERT INTO routine_connections (id, routine_id, connected_type, connected_id, position)
      SELECT gen_random_uuid()::text, r.id, 'topic', r.topic_id, 0
      FROM routines r
      WHERE r.topic_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM routine_connections rc
          WHERE rc.routine_id = r.id
            AND rc.connected_type = 'topic'
            AND rc.connected_id = r.topic_id
        )
    `);

    await db.execute(sql`ALTER TABLE routines DROP COLUMN IF EXISTS topic_id`);
    console.log("Dropped legacy `routines.topic_id` (now a routine_connections row)");
  }

  // --- location -> weekly grid entries ---
  const locationColumnExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'routines' AND column_name = 'location' AND table_schema = 'public'
    ) AS exists
  `);
  if (locationColumnExists.rows[0]?.exists) {
    // `location` used to live on the routine; it now rides on each per-day
    // weekly entry. Fold any populated location into the existing entries
    // before dropping the column. Only routines that actually carry one need
    // rewriting (weekly-mode routines never stored one).
    const rows = await db.execute<RoutineLocationRow>(sql`
      SELECT id, location, weekly FROM routines
      WHERE location IS NOT NULL AND location <> ''
    `);

    for (const row of rows.rows) {
      const location = row.location;
      if (!location) {
        continue;
      }
      const weekly = row.weekly ?? {};
      const next: RoutineWeekly = {};
      for (const [day, entry] of Object.entries(weekly)) {
        if (entry) {
          next[day as keyof RoutineWeekly] = {
            ...entry,
            location,
          };
        }
      }
      await db
        .update(routines)
        .set({
          weekly: next,
        })
        .where(eq(routines.id, row.id));
    }

    await db.execute(sql`ALTER TABLE routines DROP COLUMN IF EXISTS location`);
    console.log("Dropped legacy `routines.location` (now per-day weekly entries)");
  }
}
