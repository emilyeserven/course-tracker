import { eq } from "drizzle-orm";

import { db } from "@/db";
import { routines } from "@/db/schema";
import {
  entryForCompletionDate,
  entryToCompletionParts,
  entryToCompletionRef,
} from "@/utils/routineWeekday";

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

  // Resolve each pending date's scheduled entry; collect task/resource ids (plus
  // any narrowing module/module-group ids on resource entries) to look up names
  // in batched queries (avoids N+1).
  const entryByDate = new Map<string, RoutineReferenceItem | null>();
  const taskIds = new Set<string>();
  const resourceIds = new Set<string>();
  const moduleIds = new Set<string>();
  const moduleGroupIds = new Set<string>();
  for (const c of pending) {
    const entry = entryForCompletionDate(mode, weekly, curated, c.date);
    entryByDate.set(c.date, entry);
    if (entry?.type === "task") {
      taskIds.add(entry.id);
    }
    else if (entry?.type === "resource") {
      resourceIds.add(entry.id);
      if (entry.moduleId) {
        moduleIds.add(entry.moduleId);
      }
      if (entry.moduleGroupId) {
        moduleGroupIds.add(entry.moduleGroupId);
      }
    }
  }

  const [taskRows, resourceRows, moduleRows, moduleGroupRows] = await Promise.all([
    taskIds.size
      ? db.query.tasks.findMany({
        where: (t, {
          inArray,
        }) => inArray(t.id, [...taskIds]),
        columns: {
          id: true,
          name: true,
        },
      })
      : Promise.resolve([]),
    resourceIds.size
      ? db.query.resources.findMany({
        where: (r, {
          inArray,
        }) => inArray(r.id, [...resourceIds]),
        columns: {
          id: true,
          name: true,
        },
      })
      : Promise.resolve([]),
    moduleIds.size
      ? db.query.modules.findMany({
        where: (m, {
          inArray,
        }) => inArray(m.id, [...moduleIds]),
        columns: {
          id: true,
          name: true,
        },
      })
      : Promise.resolve([]),
    moduleGroupIds.size
      ? db.query.moduleGroups.findMany({
        where: (g, {
          inArray,
        }) => inArray(g.id, [...moduleGroupIds]),
        columns: {
          id: true,
          name: true,
        },
      })
      : Promise.resolve([]),
  ]);

  const taskNames = new Map(taskRows.map(r => [r.id, r.name]));
  const resourceNames = new Map(resourceRows.map(r => [r.id, r.name]));
  const moduleNames = new Map(moduleRows.map(r => [r.id, r.name]));
  const moduleGroupNames = new Map(moduleGroupRows.map(r => [r.id, r.name]));

  const baked: DailyCompletion[] = completions.map((c) => {
    if (!(c.status && c.entryParts === undefined)) {
      return c;
    }
    const entry = entryByDate.get(c.date) ?? null;
    return {
      ...c,
      entryParts: entryToCompletionParts(
        entry,
        taskNames,
        resourceNames,
        moduleNames,
        moduleGroupNames,
      ),
      // Frozen alongside entryParts: the structured ref keeps the scheduled
      // item's id so resource-side consumers can match by id later.
      entryRef: entryToCompletionRef(entry),
    };
  });

  return {
    ...body,
    completions: baked,
  };
}
