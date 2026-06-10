import type { EntityStatus } from "./EntityStatus";

export type DailyCompletionStatus = "incomplete" | "touched" | "goal" | "exceeded" | "freeze";

export interface DailyCompletion {
  date: string;
  status?: DailyCompletionStatus;
  note?: string;
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
  };
  // Optional sub-target within the linked course. At most one of these
  // is set; both null = the daily targets the whole course.
  moduleGroupId?: string | null;
  moduleId?: string | null;
}
