import type { EntityStatus } from "./EntityStatus";
import type {
  RoutineCurated,
  RoutineMode,
  RoutineReferenceType,
  RoutineWeekly,
} from "./Routine";

export type DailyCompletionStatus = "incomplete" | "touched" | "goal" | "exceeded" | "freeze";

// The resolved name + affixes of whatever was scheduled on the entry's date,
// frozen at save time so the log keeps reading correctly even if the schedule
// later changes. Same shape as Daily.actionParts; render via
// buildActionableSentence. Mirrors weekly/daily/curated entry resolution.
export interface DailyCompletionEntryParts {
  prependText?: string | null;
  name: string;
  appendText?: string | null;
}

// The structured reference (kind + id) of whatever was scheduled on the entry's
// date, frozen at save time alongside entryParts. Unlike entryParts (which holds
// a resolved display name), this keeps the id so consumers can tell *which*
// task/resource a completion touched even if the schedule later changes. Mirrors
// RoutineReferenceItem's discriminator.
export interface DailyCompletionEntryRef {
  type: RoutineReferenceType;
  id: string;
}

export interface DailyCompletion {
  date: string;
  status?: DailyCompletionStatus;
  note?: string;
  // Baked snapshot of the scheduled item for this date (weekly/curated routines).
  // Set server-side when a status is saved; absent on legacy/unbaked entries
  // (consumers fall back to live schedule resolution). null = nothing was
  // scheduled that day at save time.
  entryParts?: DailyCompletionEntryParts | null;
  // Structured reference (type + id) of the scheduled item, frozen together with
  // entryParts. Lets consumers match a completion to a specific task/resource by
  // id (e.g. a resource's Interactions tab) without re-resolving a schedule that
  // may have changed. Same presence rules as entryParts; null = nothing scheduled.
  entryRef?: DailyCompletionEntryRef | null;
}

export interface DailyCriteria {
  incomplete?: string;
  touched?: string;
  goal?: string;
  exceeded?: string;
  freeze?: string;
}

export type DailyStatus = EntityStatus;

export interface DailyTaskProgress {
  todosTotal: number;
  todosComplete: number;
  resourcesTotal: number;
  resourcesUsed: number;
}

export interface Daily {
  id: string;
  name: string;
  // What this projected row is backed by. "routine" (default) writes status
  // changes back to a routine's completions; "todo" writes back to a single
  // Task List todo via taskId + todoId. Lets the Do Now tracker handle both
  // sources through one table.
  kind?: "routine" | "todo";
  // Set when kind === "todo": the Task List and todo this row projects.
  todoId?: string | null;
  // The representative entry's resolved name (task/resource/freeform), wrapped
  // with any prepend/append text into a natural sentence (e.g. "Review Spanish
  // flashcards for 10 minutes"). Null unless the daily is assigned to something;
  // consumers fall back to `name` (the routine title).
  actionLabel?: string | null;
  // Structured form of `actionLabel` for styled rendering (affixes lighter than
  // the name). Null unless the daily is assigned to something; consumers fall
  // back to `name` (the routine title), which is also shown as a de-emphasized
  // subline when it differs from the action name.
  actionParts?: {
    prependText?: string | null;
    name: string;
    appendText?: string | null;
  } | null;
  location?: string | null;
  description?: string | null;
  completions: DailyCompletion[];
  status?: DailyStatus | null;
  criteria?: DailyCriteria | null;
  taskId?: string | null;
  task?: {
    id: string;
    name: string;
    progress?: DailyTaskProgress;
  } | null;
  provider?: {
    name: string;
    id: string;
  };
  resource?: {
    id: string;
    name: string;
    progressCurrent: number;
    progressTotal: number;
    // When false, the linked resource opts out of progress tracking — the
    // tracker's Progress column shows an infinity icon instead of a radial.
    tracksProgress?: boolean;
  };
  // Optional sub-target within the linked course. At most one of these
  // is set; both null = the daily targets the whole course.
  moduleGroupId?: string | null;
  moduleId?: string | null;
  // Per-weekday scheduled grid (unresolved names). Present only on weekly-mode
  // routine projections; absent/null for daily-mode dailies.
  weekly?: RoutineWeekly | null;
  // Date-keyed schedule (unresolved names). Present only on curated-mode routine
  // projections; absent/null for weekly and daily dailies.
  curated?: RoutineCurated | null;
  // Routine mode. "weekly" means the `weekly` grid is meaningful per day.
  mode?: RoutineMode | null;
  // Weekly target for daily-mode routines: how many days a week it needs doing.
  // Null/absent means no target. Carried through the routine projection so the
  // tracker can show a "nothing required today" note once the target is met.
  weeklyTarget?: number | null;
}
