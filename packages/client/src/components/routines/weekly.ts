import type {
  RoutineCurated,
  RoutineReferenceItem,
  RoutineReferenceType,
  RoutineWeekday,
  RoutineWeekly,
} from "@emstack/types";

// Display name for a routine entry — kept under its long-standing client name; the
// implementation is the cross-package `@emstack/types` helper the middleware shares.
export { routineEntryName as weeklyEntryName } from "@emstack/types";

export type WeeklyRowType = "" | "task" | "freeform" | "bookmark";

// Curated mode picks an end date at most this many days past today; the per-date
// editor never shows more rows than that.
export const MAX_CURATED_DAYS = 14;

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
  // Bookmark entries only: cached title/url + optional section narrowing.
  // "" = none. `id` holds the external bookmarkId.
  title: string;
  url: string;
  sectionId: string;
  sectionLabel: string;
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

// Any row-like source of the editable entry fields: a stored RoutineReferenceItem,
// a WeeklyRow/WeeklyEntry, or the loose entry `fillAllDays` accepts. All fields
// optional (and nullable, for the stored item), defaulting to "".
interface EntryFieldsSource {
  type?: WeeklyRowType | RoutineReferenceType | null;
  id?: string | null;
  notes?: string | null;
  location?: string | null;
  prependText?: string | null;
  appendText?: string | null;
  title?: string | null;
  url?: string | null;
  sectionId?: string | null;
  sectionLabel?: string | null;
}

// The shared editable fields of a schedule row, defaulted from an optional stored
// entry / row (empty slots become blank strings). Callers add the `day` / `date`
// key. The single place the entry field set is enumerated — weeklyToRows,
// curatedToRows, representativeRow, and fillAllDays all route through it.
function entryRowFields(entry: EntryFieldsSource | undefined): WeeklyEntry {
  return {
    type: entry?.type ?? "",
    id: entry?.id ?? "",
    notes: entry?.notes ?? "",
    location: entry?.location ?? "",
    prependText: entry?.prependText ?? "",
    appendText: entry?.appendText ?? "",
    title: entry?.title ?? "",
    url: entry?.url ?? "",
    sectionId: entry?.sectionId ?? "",
    sectionLabel: entry?.sectionLabel ?? "",
  };
}

// Build the fixed length-7 row array the form holds, defaulting from an
// existing routine's weekly object (empty days become blank rows).
export function weeklyToRows(
  weekly: RoutineWeekly | null | undefined,
): WeeklyRow[] {
  return ALL_DAYS.map(day => ({
    day,
    ...entryRowFields(weekly?.[day]),
  }));
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
  // Bookmark entries carry their cached title/url + optional section narrowing.
  if (type === "bookmark") {
    if (row.title) {
      item.title = row.title;
    }
    if (row.url) {
      item.url = row.url;
    }
    if (row.sectionId) {
      item.sectionId = row.sectionId;
    }
    if (row.sectionLabel) {
      item.sectionLabel = row.sectionLabel;
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
  return entryRowFields(rows.find(r => r.type !== ""));
}

export function fillAllDays(entry: EntryFieldsSource): WeeklyRow[] {
  const fields = entryRowFields(entry);
  return ALL_DAYS.map(day => ({
    day,
    ...fields,
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
  return dateKeys.map(date => ({
    date,
    ...entryRowFields(curated?.entries?.[date]),
  }));
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
