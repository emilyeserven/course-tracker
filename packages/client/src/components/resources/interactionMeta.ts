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
  incomplete: "bg-rose-100 text-rose-900 border-rose-200",
  started: "bg-amber-100 text-amber-900 border-amber-200",
  complete: "bg-emerald-100 text-emerald-900 border-emerald-200",
};
