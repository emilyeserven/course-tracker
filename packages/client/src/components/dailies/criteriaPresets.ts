import type { DailyCriteria } from "@emstack/types/src";

export interface CriteriaPreset {
  key: string;
  label: string;
  values: Required<DailyCriteria>;
}

export const CRITERIA_PRESETS: CriteriaPreset[] = [
  {
    key: "book",
    label: "Book Rules",
    values: {
      incomplete: "Book was not touched",
      touched: "At least a paragraph was read",
      goal: "A chapter was read",
      exceeded: "More than 1 chapter was read, or a lab was completed",
      freeze: "A different book was read",
    },
  },
  {
    key: "dailyDrill",
    label: "Daily Drill Rules",
    values: {
      incomplete: "Did not do reviews",
      touched: "Did 1 round of reviews, or at least 5 questions",
      goal: "Did assigned reviews",
      exceeded: "Did at least 1 round of reviews more than assigned",
      freeze: "Did work in the same area",
    },
  },
];
