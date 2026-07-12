import { routineEntryName } from "@emstack/types";

import type {
  DailyCompletionEntryParts,
  DailyCompletionEntryRef,
  RoutineCurated,
  RoutineMode,
  RoutineReferenceItem,
  RoutineWeekday,
  RoutineWeekly,
} from "@emstack/types";

// Date.getDay() order ("0" = Sunday … "6" = Saturday).
const DAY_KEYS: RoutineWeekday[] = ["0", "1", "2", "3", "4", "5", "6"];

// Weekday key ("0" = Sunday … "6" = Saturday) for a "YYYY-MM-DD" date key, read
// in UTC so it matches the entries-tab display (useDailyCompletions.weekdayKey)
// and the completion-baking helper.
export function weekdayForDateKey(dateKey: string): RoutineWeekday {
  return String(new Date(`${dateKey}T00:00:00Z`).getUTCDay()) as RoutineWeekday;
}

// "Today" as a "YYYY-MM-DD" date key in UTC. Pairs with weekdayForDateKey so the
// curated projection and bake agree on which date is "today".
export function currentDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

// The curated entry scheduled for a given date key, or null when that date has
// no populated entry.
export function curatedEntry(
  curated: RoutineCurated | null | undefined,
  dateKey: string,
): RoutineReferenceItem | null {
  const entry = curated?.entries?.[dateKey];
  return entry && entry.id ? entry : null;
}

// In daily mode every weekday holds the same entry, so the first populated day
// is a faithful "representative" of the routine's single task/resource. Returns
// null for an empty grid or a freeform-only routine (where the name carries the
// label).
export function representativeEntry(
  weekly: RoutineWeekly | null | undefined,
): RoutineReferenceItem | null {
  if (!weekly) {
    return null;
  }
  for (const key of DAY_KEYS) {
    const entry = weekly[key];
    if (entry && entry.id) {
      return entry;
    }
  }
  return null;
}

// "Today" as a weekday key in Date.getDay() form ("0" = Sunday … "6" = Saturday).
export function currentWeekday(now: Date = new Date()): RoutineWeekday {
  return String(now.getDay()) as RoutineWeekday;
}

// The entry that drives the projected action title. Weekly routines surface the
// current day of week's entry (null when that weekday is unscheduled), so the
// dashboard / tracker show today's task. Daily routines mirror the same entry on
// every day, so the first populated one faithfully represents them.
export function activeEntry(
  weekly: RoutineWeekly | null | undefined,
  mode: RoutineMode,
  weekday: RoutineWeekday,
): RoutineReferenceItem | null {
  if (mode === "weekly") {
    const entry = weekly?.[weekday];
    return entry && entry.id ? entry : null;
  }
  return representativeEntry(weekly);
}

// The entry scheduled on a specific date key, across all modes. Weekly routines
// resolve by that date's weekday, curated routines by the exact date, and daily
// routines mirror the representative entry on every date. Used by completion
// baking (per logged date) and the curated projection (today's date).
export function entryForCompletionDate(
  mode: RoutineMode,
  weekly: RoutineWeekly | null | undefined,
  curated: RoutineCurated | null | undefined,
  dateKey: string,
): RoutineReferenceItem | null {
  if (mode === "curated") {
    return curatedEntry(curated, dateKey);
  }
  if (mode === "weekly") {
    const entry = weekly?.[weekdayForDateKey(dateKey)];
    return entry && entry.id ? entry : null;
  }
  return representativeEntry(weekly);
}

// The bookmark whose reading progress drives a routine's projected progress ring
// for a given day: strictly today's scheduled entry, and only when that entry is
// a bookmark. Task, freeform, and unscheduled days yield null — their progress
// comes from the task's to-dos (or none at all). A routine's categorical
// bookmark *connection* deliberately never supplies progress here.
export function activeBookmarkForEntry(
  entry: RoutineReferenceItem | null,
): { id: string;
  title: string; } | null {
  if (entry?.type !== "bookmark") {
    return null;
  }
  return {
    id: entry.id,
    title: entry.title?.trim() || "Bookmark",
  };
}

// A bookmark reading-progress lookup (bookmark id → current/total), as returned
// by getBookmarkProgress.
export type BookmarkProgressMap = Map<string, { current: number;
  total: number; }>;

// A task's own bookmark rows the projection reads to back a to-do-less task's
// progress ring.
export interface TaskBookmarkRow {
  bookmarkId: string;
  title: string;
  position: number | null;
}

// The first of a task's own bookmarks (by position) that reports real reading
// progress (total > 0), shaped as { id, title } for daily.bookmarkProgress. Used
// when today's routine item is a task with no to-dos, so its linked reading
// material drives the ring instead. Null when none has progress.
export function firstTaskBookmarkWithProgress(
  bookmarks: TaskBookmarkRow[],
  progress: BookmarkProgressMap,
): { id: string;
  title: string; } | null {
  const ordered = [...bookmarks].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );
  for (const bookmark of ordered) {
    const value = progress.get(bookmark.bookmarkId);
    if (value && value.total > 0) {
      return {
        id: bookmark.bookmarkId,
        title: bookmark.title.trim() || "Bookmark",
      };
    }
  }
  return null;
}

// Freeze a scheduled entry into the parts stored on a logged completion. The
// freeform name is the entry's own text; a bookmark uses its cached title; a
// task resolves via the given name map, falling back to its id when the target
// was deleted (matching the client's `?? entry.id` rendering, via
// routineEntryName). Null entry → null (nothing was scheduled).
export function entryToCompletionParts(
  entry: RoutineReferenceItem | null,
  taskNames: Map<string, string>,
): DailyCompletionEntryParts | null {
  if (!entry) {
    return null;
  }
  return {
    prependText: entry.prependText ?? null,
    name: routineEntryName(entry, taskNames),
    appendText: entry.appendText ?? null,
  };
}

// Freeze a scheduled entry's structured reference (kind + id) onto a logged
// completion, baked alongside entryToCompletionParts. Keeping the id (not just
// the resolved name) lets a resource's Interactions tab match completions to a
// specific task/resource even after the schedule changes. Null entry → null.
export function entryToCompletionRef(
  entry: RoutineReferenceItem | null,
): DailyCompletionEntryRef | null {
  if (!entry) {
    return null;
  }
  return {
    type: entry.type,
    id: entry.id,
  };
}
