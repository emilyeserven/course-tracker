import type { DailyCompletion, DailyCriteria } from "./Daily";
import type { EntityStatus } from "./EntityStatus";

export type RoutineReferenceType = "task" | "resource" | "freeform";

// A routine is either a weekly schedule (each weekday can differ) or a daily
// task (the same entry applied to every day). Both modes carry completion
// tracking; the mode only changes how the weekly grid is edited.
export type RoutineMode = "weekly" | "daily";

export interface RoutineReferenceItem {
  type: RoutineReferenceType;
  id: string;
}

// Day-of-week keys follow Date.getDay(): "0" = Sunday ... "6" = Saturday.
export type RoutineWeekday = "0" | "1" | "2" | "3" | "4" | "5" | "6";

// Each day is optional — a routine may have no entry for some days.
export type RoutineWeekly = Partial<Record<RoutineWeekday, RoutineReferenceItem>>;

export interface Routine {
  id: string;
  name: string;
  description?: string | null;
  topicId?: string | null;
  topic?: {
    id: string;
    name: string;
  } | null;
  status?: EntityStatus | null;
  weekly?: RoutineWeekly | null;
  mode?: RoutineMode | null;
  location?: string | null;
  completions?: DailyCompletion[] | null;
  criteria?: DailyCriteria | null;
}
