import type {
  InteractionDifficulty,
  InteractionProgress,
  InteractionUnderstanding,
} from "@emstack/types";

/**
 * Shared option ordering and display metadata for interaction fields, used by
 * both the quick-log control and the full interactions log. The base unions
 * live in `@emstack/types`; these only add client-side ordering/labels/colors.
 */
export const PROGRESS_OPTIONS: InteractionProgress[] = [
  "incomplete",
  "started",
  "complete",
];

export const DIFFICULTY_OPTIONS: InteractionDifficulty[] = [
  "easy",
  "medium",
  "hard",
];

export const UNDERSTANDING_OPTIONS: InteractionUnderstanding[] = [
  "none",
  "basic",
  "comfortable",
  "proficient",
  "mastered",
];

export const PROGRESS_LABEL: Record<InteractionProgress, string> = {
  incomplete: "Incomplete",
  started: "Started",
  complete: "Complete",
};

export const PROGRESS_COLOR: Record<InteractionProgress, string> = {
  incomplete: "bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800",
  started: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800",
  complete: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800",
};
