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
  // The representative entry's name wrapped with its prepend/append text into a
  // natural sentence (e.g. "Review Spanish flashcards for 10 minutes"). Null
  // unless prepend or append text is set; consumers fall back to `name`.
  actionLabel?: string | null;
  // Structured form of `actionLabel` for styled rendering (affixes lighter than
  // the name). Null unless prepend/append text is set; consumers fall back to `name`.
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
