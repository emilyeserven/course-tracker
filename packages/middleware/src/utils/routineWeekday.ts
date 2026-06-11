import type {
  RoutineMode,
  RoutineReferenceItem,
  RoutineWeekday,
  RoutineWeekly,
} from "@emstack/types";

// Date.getDay() order ("0" = Sunday … "6" = Saturday).
const DAY_KEYS: RoutineWeekday[] = ["0", "1", "2", "3", "4", "5", "6"];

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
