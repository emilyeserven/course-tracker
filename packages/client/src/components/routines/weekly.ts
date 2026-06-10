import type { RoutineWeekday, RoutineWeekly } from "@emstack/types/src";

export type WeeklyRowType = "" | "task" | "resource" | "freeform";

export interface WeeklyRow {
  day: RoutineWeekday;
  // "" = no entry scheduled for this day.
  type: WeeklyRowType;
  id: string;
}

// Day-of-week keys follow Date.getDay(): "0" = Sunday ... "6" = Saturday.
const ALL_DAYS: RoutineWeekday[] = ["0", "1", "2", "3", "4", "5", "6"];

// Display order is Monday-first; storage stays keyed by getDay() number.
export const DAY_ORDER: RoutineWeekday[] = ["1", "2", "3", "4", "5", "6", "0"];

export const DAY_LABELS: Record<RoutineWeekday, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

// Build the fixed length-7 row array the form holds, defaulting from an
// existing routine's weekly object (empty days become blank rows).
export function weeklyToRows(
  weekly: RoutineWeekly | null | undefined,
): WeeklyRow[] {
  return ALL_DAYS.map((day) => {
    const entry = weekly?.[day];
    return {
      day,
      type: entry?.type ?? "",
      id: entry?.id ?? "",
    };
  });
}

// Serialize rows back to the weekly object, dropping days without a complete
// {type, id} pair.
export function rowsToWeekly(rows: WeeklyRow[]): RoutineWeekly {
  const weekly: RoutineWeekly = {};
  for (const row of rows) {
    if ((row.type === "task" || row.type === "resource" || row.type === "freeform") && row.id) {
      weekly[row.day] = {
        type: row.type,
        id: row.id,
      };
    }
  }
  return weekly;
}
