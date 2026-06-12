import { pgEnum } from "drizzle-orm/pg-core";

// JSONB column shapes come from the shared types package — the single source
// of truth the client uses too. Type-only re-exports are erased at build time,
// so the schema layer gains no runtime dependency (drizzle-kit's bundler never
// sees an import). The local copies these replace had already drifted
// (DailyCriteria was missing `freeze`; RoutineReferenceItem was missing
// prependText/appendText).
export type {
  DailyCompletion,
  DailyCompletionStatus,
  DailyCriteria,
  RoutineConnectionType,
  RoutineReferenceItem,
  RoutineWeekday,
  RoutineWeekly,
} from "@emstack/types";

export const recurPeriodUnitEnum = pgEnum("recurPeriodUnit", ["days", "months", "years"]);
export const statusEnum = pgEnum("status", ["active", "inactive", "complete", "paused"]);
export const dailyCompletionStatusEnum = pgEnum("dailyCompletionStatus", ["incomplete", "touched", "goal", "exceeded", "freeze"]);
export const resourceLevelEnum = pgEnum("resourceLevel", ["low", "medium", "high"]);
export const routineModeEnum = pgEnum("routine_mode", ["weekly", "daily"]);
export const interactionProgressEnum = pgEnum("interaction_progress", ["incomplete", "started", "complete"]);
export const interactionDifficultyEnum = pgEnum("interaction_difficulty", ["easy", "medium", "hard"]);
export const interactionUnderstandingEnum = pgEnum("interaction_understanding", ["none", "basic", "comfortable", "proficient", "mastered"]);
