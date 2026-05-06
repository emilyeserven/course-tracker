export type DailyCompletionStatus = "incomplete" | "touched" | "goal" | "exceeded";

export interface DailyCompletion {
  date: string;
  status: DailyCompletionStatus;
}

export interface Daily {
  id: string;
  name: string;
  location?: string | null;
  description?: string | null;
  completions: DailyCompletion[];
  provider?: {
    name: string;
    id: string;
  };
}
