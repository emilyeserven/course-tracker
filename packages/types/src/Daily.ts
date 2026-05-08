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

export type DailyStatus = "active" | "inactive" | "complete" | "paused";

export interface DailyTaskProgress {
  todosTotal: number;
  todosComplete: number;
  resourcesTotal: number;
  resourcesUsed: number;
}

export interface Daily {
  id: string;
  name: string;
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
  course?: {
    id: string;
    name: string;
    progressCurrent: number;
    progressTotal: number;
  };
}
