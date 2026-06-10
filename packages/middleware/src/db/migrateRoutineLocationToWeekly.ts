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

// Idempotent: `location` used to live on the routine itself; it now lives on
// each per-day weekly entry. Fold every routine's legacy `location` into its
// populated weekly entries, then drop the column. Guarded on the `location`
// column still existing, so re-runs after the drop are no-ops.
export async function migrateRoutineLocationToWeekly() {
  const routinesExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'routines'
    ) AS exists
  `);
  if (!routinesExists.rows[0]?.exists) {
    return;
  }

  const locationColumnExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'routines' AND column_name = 'location'
    ) AS exists
  `);
  if (!locationColumnExists.rows[0]?.exists) {
    return;
  }

  // Only routines that actually carry a location need rewriting. Weekly-mode
  // routines never stored one (the form forced null), so in practice this is the
  // daily-mode set, where every day holds the same entry.
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

  // Drop the now-unused column. Once gone, the guard above short-circuits future
  // runs and a later `drizzle-kit push` sees a matching (location-free) schema.
  await db.execute(sql`ALTER TABLE routines DROP COLUMN IF EXISTS location`);
}
