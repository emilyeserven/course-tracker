import { eq } from "drizzle-orm";

import { db } from "@/db";
import { routines } from "@/db/schema";
import {
  entryForCompletionDate,
  entryToCompletionParts,
  entryToCompletionRef,
} from "@/utils/routineWeekday";
import { taskNamesByIds } from "@/utils/taskNames";

import type { RoutineBody } from "./routineRows";
import type { DailyCompletion, RoutineReferenceItem } from "@emstack/types";

// Bake the scheduled task text into a routine's logged entries at save time
// (weekly & curated routines only). For each completion that has a status but is
// not yet baked, resolve the entry scheduled on that date (weekly → that date's
// weekday, curated → that date) and freeze its resolved name + prepend/append
// into `entryParts`, so the entries log keeps reading correctly even if the
// schedule later changes. Used as the `prepareBody` hook on the routine
// create/upsert handlers, so every save path (entries tab, tracker, dashboard,
// comment popover) bakes uniformly.
//
// Date keys are resolved in UTC (see entryForCompletionDate / weekdayForDateKey)
// to match the entries-tab display. Daily-mode routines are intentionally left
// unbaked — the requirement covers weekly & curated, and the daily entries tab
// shows no per-day scheduled item.
export async function bakeRoutineCompletions(
  body: RoutineBody,
  id: string,
): Promise<RoutineBody> {
  const completions = body.completions;
  if (!completions || completions.length === 0) {
    return body;
  }

  // Only newly-statused, not-yet-frozen completions need baking. Already-baked
  // entries (entryParts present, even null) stay frozen.
  const pending = completions.filter(
    c => c.status && c.entryParts === undefined,
  );
  if (pending.length === 0) {
    return body;
  }

  // Effective schedule grids: the request body wins; fall back to the stored row
  // for partial completion-only saves (the common case — the client sends just
  // name + completions).
  const existing
    = body.mode === undefined
      || body.weekly === undefined
      || body.curated === undefined
      ? await db.query.routines.findFirst({
        where: eq(routines.id, id),
        columns: {
          mode: true,
          weekly: true,
          curated: true,
        },
      })
      : undefined;

  const mode = body.mode ?? existing?.mode ?? "weekly";
  // Baking is defined only for weekly & curated routines.
  if (mode !== "weekly" && mode !== "curated") {
    return body;
  }
  const weekly = body.weekly ?? existing?.weekly ?? {};
  const curated = body.curated
    ?? existing?.curated ?? {
    endDate: null,
    entries: {},
  };

  // Resolve each pending date's scheduled entry; collect task ids to look up
  // names in a batched query (avoids N+1). Bookmark and freeform entries carry
  // their own display label on the entry.
  const entryByDate = new Map<string, RoutineReferenceItem | null>();
  const taskIds = new Set<string>();
  for (const c of pending) {
    const entry = entryForCompletionDate(mode, weekly, curated, c.date);
    entryByDate.set(c.date, entry);
    if (entry?.type === "task") {
      taskIds.add(entry.id);
    }
  }

  const taskNames = await taskNamesByIds(taskIds);

  const baked: DailyCompletion[] = completions.map((c) => {
    if (!(c.status && c.entryParts === undefined)) {
      return c;
    }
    const entry = entryByDate.get(c.date) ?? null;
    return {
      ...c,
      entryParts: entryToCompletionParts(entry, taskNames),
      // Frozen alongside entryParts: the structured ref keeps the scheduled
      // item's id so consumers can match by id later.
      entryRef: entryToCompletionRef(entry),
    };
  });

  return {
    ...body,
    completions: baked,
  };
}
