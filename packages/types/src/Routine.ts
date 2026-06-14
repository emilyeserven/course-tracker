import type { DailyCompletion, DailyCriteria } from "./Daily";
import type { EntityStatus } from "./EntityStatus";

export type RoutineReferenceType = "task" | "resource" | "freeform";

// A routine can be connected to any number of these entity kinds. The
// connection is the routine's categorical link (what it's "about"); it is
// separate from the weekly grid, which is the per-day activity.
export type RoutineConnectionType = "topic" | "task" | "resource";

// A single polymorphic connection. `name` is resolved on read for display and
// omitted on write (the client sends only `type` + `id`).
export interface RoutineConnection {
  type: RoutineConnectionType;
  id: string;
  name?: string | null;
}

// A routine is a weekly schedule (each weekday can differ), a daily task (the
// same entry applied to every day), or a curated run (a task per calendar date
// from today up to a chosen end date, at most 14 days out). All modes carry
// completion tracking; the mode only changes how the schedule grid is edited.
export type RoutineMode = "weekly" | "daily" | "curated";

export interface RoutineReferenceItem {
  type: RoutineReferenceType;
  id: string;
  // Optional free-text annotation for this day's scheduled item (e.g. "focus
  // on the subjunctive"). Empty/absent means no note.
  notes?: string | null;
  // Optional place/link where this day's item happens (e.g. "gym", "Spanish
  // app", or a URL). Empty/absent means no location.
  location?: string | null;
  // Optional text wrapped around the item's name to form a natural, actionable
  // sentence (e.g. prepend "Review" / append "for 10 minutes"). Empty/absent
  // means the name stands alone.
  prependText?: string | null;
  appendText?: string | null;
}

// Day-of-week keys follow Date.getDay(): "0" = Sunday ... "6" = Saturday.
export type RoutineWeekday = "0" | "1" | "2" | "3" | "4" | "5" | "6";

// Each day is optional — a routine may have no entry for some days.
export type RoutineWeekly = Partial<Record<RoutineWeekday, RoutineReferenceItem>>;

// Curated mode's schedule: a chosen end date (≤ 14 days from "today") plus a map
// of absolute date keys ("YYYY-MM-DD") to that date's scheduled item. The start
// is implicitly today; `endDate` is null until the user picks one. Each date is
// optional — a curated run may have no entry for some days in the range.
export interface RoutineCurated {
  endDate: string | null;
  entries: Partial<Record<string, RoutineReferenceItem>>;
}

export interface Routine {
  id: string;
  name: string;
  description?: string | null;
  connections?: RoutineConnection[] | null;
  status?: EntityStatus | null;
  weekly?: RoutineWeekly | null;
  // Curated-mode schedule (date-keyed). Present/meaningful only when
  // mode === "curated"; absent/empty for weekly and daily routines.
  curated?: RoutineCurated | null;
  mode?: RoutineMode | null;
  completions?: DailyCompletion[] | null;
  criteria?: DailyCriteria | null;
  // For daily-mode routines: how many days a week the routine needs to be done.
  // Null/absent means no target (every day). Only goal/exceeded days count.
  weeklyTarget?: number | null;
}

// The resolved entry a weekly routine schedules for today (task / resource /
// freeform name plus any affixes), computed by the client so a card can show
// today's task in place of the routine name.
export interface RoutineTodayAction {
  name: string;
  prependText?: string | null;
  appendText?: string | null;
}
