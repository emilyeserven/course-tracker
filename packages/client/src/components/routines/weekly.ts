import type {
  RoutineCurated,
  RoutineReferenceItem,
  RoutineReferenceType,
  RoutineWeekday,
  RoutineWeekly,
} from "@emstack/types";

import { resourceEntryLabel } from "@emstack/types";

export type WeeklyRowType = "" | "task" | "resource" | "freeform";

// Curated mode picks an end date at most this many days past today; the per-date
// editor never shows more rows than that.
export const MAX_CURATED_DAYS = 14;

export interface WeeklyRow {
  day: RoutineWeekday;
  // "" = no entry scheduled for this day.
  type: WeeklyRowType;
  id: string;
  // Resource entries may narrow to a specific module or module group (mutually
  // exclusive). "" = the whole resource. Ignored for task/freeform entries.
  moduleId: string;
  moduleGroupId: string;
  // Optional free-text note for this day's item. "" = no note.
  notes: string;
  // Optional place/link where this day's item happens. "" = no location.
  location: string;
  // Optional text wrapped around the item's name to form an actionable
  // sentence. "" = nothing to prepend/append.
  prependText: string;
  appendText: string;
}

// A weekly entry without its day key — the shared item shape Daily Task mode
// reads/writes (the same entry applies to every weekday).
export type WeeklyEntry = Omit<WeeklyRow, "day">;

// Curated mode's row: the same editable fields as a weekly row, keyed by an
// absolute date ("YYYY-MM-DD") instead of a weekday.
export interface CuratedRow extends WeeklyEntry {
  date: string;
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
      moduleId: entry?.moduleId ?? "",
      moduleGroupId: entry?.moduleGroupId ?? "",
      notes: entry?.notes ?? "",
      location: entry?.location ?? "",
      prependText: entry?.prependText ?? "",
      appendText: entry?.appendText ?? "",
    };
  });
}

// A row's reference item, persisting optional text only when present to keep
// the stored JSON clean. Takes only the shared entry fields, so it serves both
// weekly rows and curated date rows.
function referenceItemFromRow(
  row: WeeklyEntry,
  type: RoutineReferenceType,
): RoutineReferenceItem {
  const item: RoutineReferenceItem = {
    type,
    id: row.id,
  };
  // Module narrowing only applies to resource entries, and the two are mutually
  // exclusive — persist at most one.
  if (type === "resource") {
    if (row.moduleId) {
      item.moduleId = row.moduleId;
    }
    else if (row.moduleGroupId) {
      item.moduleGroupId = row.moduleGroupId;
    }
  }
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
export function representativeRow(rows: WeeklyRow[]): WeeklyEntry {
  const found = rows.find(r => r.type !== "");
  return found
    ? {
      type: found.type,
      id: found.id,
      moduleId: found.moduleId,
      moduleGroupId: found.moduleGroupId,
      notes: found.notes,
      location: found.location,
      prependText: found.prependText,
      appendText: found.appendText,
    }
    : {
      type: "",
      id: "",
      moduleId: "",
      moduleGroupId: "",
      notes: "",
      location: "",
      prependText: "",
      appendText: "",
    };
}

export function fillAllDays(entry: {
  type: WeeklyRowType;
  id: string;
  moduleId?: string;
  moduleGroupId?: string;
  notes?: string;
  location?: string;
  prependText?: string;
  appendText?: string;
}): WeeklyRow[] {
  return ALL_DAYS.map(day => ({
    day,
    type: entry.type,
    id: entry.id,
    moduleId: entry.moduleId ?? "",
    moduleGroupId: entry.moduleGroupId ?? "",
    notes: entry.notes ?? "",
    location: entry.location ?? "",
    prependText: entry.prependText ?? "",
    appendText: entry.appendText ?? "",
  }));
}

// The inclusive list of date keys ("YYYY-MM-DD") a curated routine spans:
// [start, end], clamped so it never reaches past start + MAX_CURATED_DAYS. An
// absent/earlier end yields an empty range (nothing to schedule yet). Date math
// is done in UTC so the keys match the entries-tab / server resolution.
export function curatedDateRange(
  startKey: string,
  endKey: string | null | undefined,
): string[] {
  if (!startKey || !endKey) {
    return [];
  }
  const start = new Date(`${startKey}T00:00:00Z`);
  const maxEnd = new Date(start);
  maxEnd.setUTCDate(maxEnd.getUTCDate() + MAX_CURATED_DAYS);
  let end = new Date(`${endKey}T00:00:00Z`);
  if (end > maxEnd) {
    end = maxEnd;
  }
  if (end < start) {
    return [];
  }
  const keys: string[] = [];
  for (
    const d = new Date(start);
    d <= end;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

// Human label for a curated date key ("YYYY-MM-DD"), e.g. "Mon, Jun 15". Read in
// UTC to match the curated date keys (which curatedDateRange also builds in UTC).
export function formatCuratedDateLabel(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Build the curated editor rows for a set of date keys, defaulting each from the
// routine's stored entries (empty dates become blank rows).
export function curatedToRows(
  curated: RoutineCurated | null | undefined,
  dateKeys: string[],
): CuratedRow[] {
  return dateKeys.map((date) => {
    const entry = curated?.entries?.[date];
    return {
      date,
      type: entry?.type ?? "",
      id: entry?.id ?? "",
      moduleId: entry?.moduleId ?? "",
      moduleGroupId: entry?.moduleGroupId ?? "",
      notes: entry?.notes ?? "",
      location: entry?.location ?? "",
      prependText: entry?.prependText ?? "",
      appendText: entry?.appendText ?? "",
    };
  });
}

// Serialize curated rows back to the stored shape, dropping dates without a
// complete {type, id} pair. Only in-range rows are written, so shortening the
// end date prunes now-out-of-range entries.
export function rowsToCurated(
  rows: CuratedRow[],
  endDate: string | null,
): RoutineCurated {
  const entries: RoutineCurated["entries"] = {};
  for (const row of rows) {
    if (row.type === "" || !row.id) {
      continue;
    }
    entries[row.date] = referenceItemFromRow(row, row.type);
  }
  return {
    endDate,
    entries,
  };
}

// Display name for a weekly entry: freeform entries carry their own text in
// `id`; task / resource entries resolve through the id → name maps and fall
// back to the raw id when the lookup misses. A resource entry that narrows to a
// module or module group shows that narrower name in place of the resource name
// (see resourceEntryLabel).
export function weeklyEntryName(
  entry: RoutineReferenceItem,
  taskNames: Map<string, string>,
  resourceNames: Map<string, string>,
  moduleNames = new Map<string, string>(),
  moduleGroupNames = new Map<string, string>(),
): string {
  if (entry.type === "freeform") {
    return entry.id;
  }
  if (entry.type === "task") {
    return taskNames.get(entry.id) ?? entry.id;
  }
  return resourceEntryLabel({
    resourceName: resourceNames.get(entry.id) ?? entry.id,
    moduleName: entry.moduleId ? moduleNames.get(entry.moduleId) : null,
    groupName: entry.moduleGroupId
      ? moduleGroupNames.get(entry.moduleGroupId)
      : null,
  });
}
