import { pgEnum } from "drizzle-orm/pg-core";

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
}

// Day-of-week keys follow Date.getDay(): "0" = Sunday ... "6" = Saturday.
// Declared locally (mirroring DailyCompletion/DailyCriteria) to avoid a
// circular dependency on @emstack/types from the schema layer.
export type RoutineWeekday = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export interface RoutineReferenceItem {
  type: "task" | "resource" | "freeform";
  id: string;
  notes?: string | null;
  location?: string | null;
}

export type RoutineWeekly = Partial<Record<RoutineWeekday, RoutineReferenceItem>>;

// Declared locally (like the types above) to avoid a circular dependency on
// @emstack/types from the schema layer.
export type RoutineConnectionType = "topic" | "task" | "resource";

export const recurPeriodUnitEnum = pgEnum("recurPeriodUnit", ["days", "months", "years"]);
export const statusEnum = pgEnum("status", ["active", "inactive", "complete", "paused"]);
export const dailyCompletionStatusEnum = pgEnum("dailyCompletionStatus", ["incomplete", "touched", "goal", "exceeded", "freeze"]);
export const resourceLevelEnum = pgEnum("resourceLevel", ["low", "medium", "high"]);
export const routineModeEnum = pgEnum("routine_mode", ["weekly", "daily"]);
export const interactionProgressEnum = pgEnum("interaction_progress", ["incomplete", "started", "complete"]);
export const interactionDifficultyEnum = pgEnum("interaction_difficulty", ["easy", "medium", "hard"]);
export const interactionUnderstandingEnum = pgEnum("interaction_understanding", ["none", "basic", "comfortable", "proficient", "mastered"]);
