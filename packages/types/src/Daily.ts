export type DailyCompletionStatus = "incomplete" | "touched" | "goal" | "exceeded";

export interface DailyCompletion {
  date: string;
  status?: DailyCompletionStatus;
  note?: string;
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
  course?: {
    id: string;
    name: string;
    progressCurrent: number;
    progressTotal: number;
  };
}
