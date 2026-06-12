import type {
  RoutineReferenceItem,
  RoutineReferenceType,
  RoutineWeekday,
  RoutineWeekly,
} from "@emstack/types";

export type WeeklyRowType = "" | "task" | "resource" | "freeform";

export interface WeeklyRow {
  day: RoutineWeekday;
  // "" = no entry scheduled for this day.
  type: WeeklyRowType;
  id: string;
  // Optional free-text note for this day's item. "" = no note.
  notes: string;
  // Optional place/link where this day's item happens. "" = no location.
  location: string;
  // Optional text wrapped around the item's name to form an actionable
  // sentence. "" = nothing to prepend/append.
  prependText: string;
  appendText: string;
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
      notes: entry?.notes ?? "",
      location: entry?.location ?? "",
      prependText: entry?.prependText ?? "",
      appendText: entry?.appendText ?? "",
    };
  });
}

// A row's reference item, persisting optional text only when present to keep
// the stored JSON clean.
function referenceItemFromRow(
  row: WeeklyRow,
  type: RoutineReferenceType,
): RoutineReferenceItem {
  const item: RoutineReferenceItem = {
    type,
    id: row.id,
  };
  if (row.notes) {
    item.notes = row.notes;
  }
  if (row.location) {
    item.location = row.location;
  }
  if (row.prependText) {
    item.prependText = row.prependText;
  }
  if (row.appendText) {
    item.appendText = row.appendText;
  }
  return item;
}

// Serialize rows back to the weekly object, dropping days without a complete
// {type, id} pair.
export function rowsToWeekly(rows: WeeklyRow[]): RoutineWeekly {
  const weekly: RoutineWeekly = {};
  for (const row of rows) {
    if (row.type === "" || !row.id) {
      continue;
    }
    weekly[row.day] = referenceItemFromRow(row, row.type);
  }
  return weekly;
}

// Daily Task mode keeps the same entry on every weekday. `representativeRow`
// reads that shared entry (the first day with a type), and `fillAllDays` writes
// a single entry across the whole length-7 grid. We match on `type` alone — not
// `type && id` — so a half-chosen entry (a type picked before its item) still
// surfaces; otherwise the controlled type <select> would snap back to "None" and
// the item picker would never enable.
export function representativeRow(rows: WeeklyRow[]): {
  type: WeeklyRowType;
  id: string;
  notes: string;
  location: string;
  prependText: string;
  appendText: string;
} {
  const found = rows.find(r => r.type !== "");
  return found
    ? {
      type: found.type,
      id: found.id,
      notes: found.notes,
      location: found.location,
      prependText: found.prependText,
      appendText: found.appendText,
    }
    : {
      type: "",
      id: "",
      notes: "",
      location: "",
      prependText: "",
      appendText: "",
    };
}

export function fillAllDays(entry: {
  type: WeeklyRowType;
  id: string;
  notes?: string;
  location?: string;
  prependText?: string;
  appendText?: string;
}): WeeklyRow[] {
  return ALL_DAYS.map(day => ({
    day,
    type: entry.type,
    id: entry.id,
    notes: entry.notes ?? "",
    location: entry.location ?? "",
    prependText: entry.prependText ?? "",
    appendText: entry.appendText ?? "",
  }));
}

// Display name for a weekly entry: freeform entries carry their own text in
// `id`; task / resource entries resolve through the id → name maps and fall
// back to the raw id when the lookup misses.
export function weeklyEntryName(
  entry: RoutineReferenceItem,
  taskNames: Map<string, string>,
  resourceNames: Map<string, string>,
): string {
  if (entry.type === "freeform") {
    return entry.id;
  }
  const names = entry.type === "task" ? taskNames : resourceNames;
  return names.get(entry.id) ?? entry.id;
}
