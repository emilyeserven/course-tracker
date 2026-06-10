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

// A routine is either a weekly schedule (each weekday can differ) or a daily
// task (the same entry applied to every day). Both modes carry completion
// tracking; the mode only changes how the weekly grid is edited.
export type RoutineMode = "weekly" | "daily";

export interface RoutineReferenceItem {
  type: RoutineReferenceType;
  id: string;
  // Optional free-text annotation for this day's scheduled item (e.g. "focus
  // on the subjunctive"). Empty/absent means no note.
  notes?: string | null;
}

// Day-of-week keys follow Date.getDay(): "0" = Sunday ... "6" = Saturday.
export type RoutineWeekday = "0" | "1" | "2" | "3" | "4" | "5" | "6";

// Each day is optional — a routine may have no entry for some days.
export type RoutineWeekly = Partial<Record<RoutineWeekday, RoutineReferenceItem>>;

export interface Routine {
  id: string;
  name: string;
  description?: string | null;
  connections?: RoutineConnection[] | null;
  status?: EntityStatus | null;
  weekly?: RoutineWeekly | null;
  mode?: RoutineMode | null;
  location?: string | null;
  completions?: DailyCompletion[] | null;
  criteria?: DailyCriteria | null;
}
