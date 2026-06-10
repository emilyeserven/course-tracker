import { sql } from "drizzle-orm";

import { db } from "@/db/index";
import { dailies, routines } from "@/db/schema";
import type { RoutineWeekly } from "@emstack/types";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

const DAY_KEYS = ["0", "1", "2", "3", "4", "5", "6"] as const;

// In the unified model the same entry is applied to every weekday, so a daily's
// single task/resource link becomes a 7-day grid pointing at it.
function buildWeekly(
  entry: { type: "task" | "resource";
    id: string; } | null,
): RoutineWeekly {
  if (!entry) {
    return {};
  }
  const weekly: RoutineWeekly = {};
  for (const key of DAY_KEYS) {
    weekly[key] = {
      type: entry.type,
      id: entry.id,
    };
  }
  return weekly;
}

// Idempotent: copy every `dailies` row into a daily-mode `routines` row (same
// id). Re-runs skip ids already present (ON CONFLICT DO NOTHING), so edits made
// after the first migration are preserved. The `dailies` table is left intact as
// a dormant backup.
export async function migrateDailiesToRoutines() {
  const routinesExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'routines'
    ) AS exists
  `);
  if (!routinesExists.rows[0]?.exists) {
    return;
  }

  const dailiesExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'dailies'
    ) AS exists
  `);
  if (!dailiesExists.rows[0]?.exists) {
    return;
  }

  // Self-apply the tracking columns/enum so the data copy is independent of
  // whether `drizzle-kit push` has run yet (prod runs migrate before push). A
  // later push sees matching definitions and is a no-op.
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'routine_mode') THEN
        CREATE TYPE routine_mode AS ENUM ('weekly', 'daily');
      END IF;
    END $$;
  `);
  await db.execute(sql`ALTER TABLE routines ADD COLUMN IF NOT EXISTS mode routine_mode NOT NULL DEFAULT 'weekly'`);
  await db.execute(sql`ALTER TABLE routines ADD COLUMN IF NOT EXISTS location varchar(255)`);
  await db.execute(sql`ALTER TABLE routines ADD COLUMN IF NOT EXISTS completions jsonb NOT NULL DEFAULT '[]'::jsonb`);
  await db.execute(sql`ALTER TABLE routines ADD COLUMN IF NOT EXISTS criteria jsonb NOT NULL DEFAULT '{}'::jsonb`);

  const allDailies = await db.select().from(dailies);
  if (allDailies.length === 0) {
    return;
  }

  const rows = allDailies.map((daily) => {
    const entry = daily.taskId
      ? {
        type: "task" as const,
        id: daily.taskId,
      }
      : daily.resourceId
        ? {
          type: "resource" as const,
          id: daily.resourceId,
        }
        : null;

    return {
      id: daily.id,
      name: daily.name,
      description: daily.description ?? null,
      topicId: null,
      status: daily.status ?? "active",
      weekly: buildWeekly(entry),
      mode: "daily" as const,
      location: daily.location ?? null,
      completions: daily.completions ?? [],
      criteria: daily.criteria ?? {},
    };
  });

  await db
    .insert(routines)
    .values(rows)
    .onConflictDoNothing({
      target: routines.id,
    });
}
