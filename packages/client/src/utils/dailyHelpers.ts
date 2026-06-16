import type { WeekTargetWindow } from "@/stores/settingsStore";
import type {
  Daily,
  DailyCompletionStatus,
  RoutineWeekday,
} from "@emstack/types";

// Local-time "YYYY-MM-DD" key for a date. Read in local time (not UTC) so a
// calendar day the user picks maps to the same key they see — matching the
// curated-schedule resolution and getTodayKey().
export function getDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayKey(): string {
  return getDateKey(new Date());
}

/**
 * The tooltip a daily's task/resource indicator shows: the linked entity's name,
 * unless it already matches the daily's own title (then a plain "Go to …" CTA).
 */
export function dailyLinkTooltip(
  entityName: string,
  dailyName: string,
  goLabel: string,
): string {
  const titlesMatch
    = entityName.trim().toLowerCase() === dailyName.trim().toLowerCase();
  return titlesMatch ? goLabel : entityName;
}

export function shiftDateKey(key: string, deltaDays: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export function findStatusForDate(
  daily: Pick<Daily, "completions">,
  dateKey: string,
): DailyCompletionStatus | null {
  return daily.completions.find(c => c.date === dateKey)?.status ?? null;
}

export function getCurrentChain(
  daily: Pick<Daily, "completions">,
  todayKey: string = getTodayKey(),
): number {
  const completedDates = new Set(
    daily.completions
      .filter(c => c.status && c.status !== "incomplete")
      .map(c => c.date),
  );

  let cursor = todayKey;
  if (!completedDates.has(cursor)) {
    cursor = shiftDateKey(cursor, -1);
    if (!completedDates.has(cursor)) {
      return 0;
    }
  }

  let count = 0;
  while (completedDates.has(cursor)) {
    count++;
    cursor = shiftDateKey(cursor, -1);
  }
  return count;
}

export function getTotalCompletedDays(
  daily: Pick<Daily, "completions">,
): number {
  return daily.completions.filter(c => c.status && c.status !== "incomplete")
    .length;
}

export function getLongestStreak(daily: Daily): number {
  const completedDates = daily.completions
    .filter(c => c.status && c.status !== "incomplete")
    .map(c => c.date)
    .sort();

  if (completedDates.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;
  for (let i = 1; i < completedDates.length; i++) {
    if (shiftDateKey(completedDates[i - 1], 1) === completedDates[i]) {
      current += 1;
      if (current > longest) longest = current;
    }
    else {
      current = 1;
    }
  }
  return longest;
}

export function getLastEntryDate(daily: Daily): string | null {
  let latest: string | null = null;
  for (const c of daily.completions) {
    if (!latest || c.date > latest) {
      latest = c.date;
    }
  }
  return latest;
}

function getFirstEntryDate(daily: Daily): string | null {
  let earliest: string | null = null;
  for (const c of daily.completions) {
    if (!earliest || c.date < earliest) {
      earliest = c.date;
    }
  }
  return earliest;
}

export function getDaysBetweenFirstAndLastEntry(daily: Daily): number {
  const first = getFirstEntryDate(daily);
  const last = getLastEntryDate(daily);
  if (!first || !last) {
    return 0;
  }
  const firstMs = new Date(`${first}T00:00:00Z`).getTime();
  const lastMs = new Date(`${last}T00:00:00Z`).getTime();
  return Math.round((lastMs - firstMs) / (1000 * 60 * 60 * 24)) + 1;
}

export function getReferenceDateKey(
  daily: Daily,
  todayKey: string = getTodayKey(),
): string {
  if (daily.status !== "complete") {
    return todayKey;
  }
  let latest: string | null = null;
  for (const c of daily.completions) {
    if (!latest || c.date > latest) {
      latest = c.date;
    }
  }
  return latest ?? todayKey;
}

const SHORT_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type DayLabelFormat = "dow" | "mmdd";

interface RecentDay {
  dateKey: string;
  dayLabel: string;
  isToday: boolean;
  status: DailyCompletionStatus | null;
}

export function getRecentDays(
  daily: Daily,
  count = 7,
  todayKey: string = getTodayKey(),
  labelFormat: DayLabelFormat = "dow",
): RecentDay[] {
  const days: RecentDay[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const dateKey = shiftDateKey(todayKey, -i);
    const date = new Date(`${dateKey}T00:00:00Z`);
    const dayLabel
      = labelFormat === "mmdd"
        ? `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`
        : SHORT_DAY_LABELS[date.getUTCDay()];
    days.push({
      dateKey,
      dayLabel,
      isToday: dateKey === todayKey,
      status: findStatusForDate(daily, dateKey),
    });
  }
  return days;
}

// The inclusive [start, end] date-key range counted for a weekly target, given
// the user's chosen window. Calendar weeks use JS getUTCDay (0 = Sunday); the
// rolling window is simply the trailing 7 days ending today.
function getWeekWindow(
  todayKey: string,
  window: WeekTargetWindow,
): { start: string;
  end: string; } {
  if (window === "rolling7") {
    return {
      start: shiftDateKey(todayKey, -6),
      end: todayKey,
    };
  }
  const dow = new Date(`${todayKey}T00:00:00Z`).getUTCDay();
  const offsetToStart = window === "monday" ? (dow === 0 ? 6 : dow - 1) : dow;
  const start = shiftDateKey(todayKey, -offsetToStart);
  return {
    start,
    end: shiftDateKey(start, 6),
  };
}

// Only days the user actually hit their goal on count toward a weekly target —
// a started-but-unfinished ("touched") or frozen day does not.
function countsTowardTarget(
  status: DailyCompletionStatus | undefined | null,
): boolean {
  return status === "goal" || status === "exceeded";
}

export function getCompletedDaysThisWeek(
  daily: Pick<Daily, "completions">,
  todayKey: string,
  window: WeekTargetWindow,
): number {
  const {
    start, end,
  } = getWeekWindow(todayKey, window);
  return daily.completions.filter(
    c => countsTowardTarget(c.status) && c.date >= start && c.date <= end,
  ).length;
}

// True for a daily-mode routine whose weekly target (N goal/exceeded days) has
// already been reached or exceeded for the current window — i.e. nothing is
// required today. No target (null / <= 0) is never "met".
export function isWeeklyTargetMet(
  daily: Pick<Daily, "completions" | "weeklyTarget">,
  todayKey: string,
  window: WeekTargetWindow,
): boolean {
  const target = daily.weeklyTarget;
  if (!target || target <= 0) {
    return false;
  }
  return getCompletedDaysThisWeek(daily, todayKey, window) >= target;
}

const DAY_KEYS: RoutineWeekday[] = ["0", "1", "2", "3", "4", "5", "6"];

// Date.getDay() weekday key ("0" = Sunday … "6" = Saturday) for a date key,
// read in local time to stay consistent with getTodayKey().
function weekdayForKey(dateKey: string): RoutineWeekday {
  return String(new Date(`${dateKey}T00:00:00`).getDay()) as RoutineWeekday;
}

// True when the routine has a scheduled entry that applies on the given day:
// curated routines key by the exact date, weekly-mode routines schedule per
// weekday, while daily-mode (or unset) ones use the representative entry (the
// first populated day, mirrored to every day). Mirrors the middleware
// entryForCompletionDate/representativeEntry projection helpers.
export function isScheduledForDay(
  daily: Pick<Daily, "weekly" | "mode" | "curated">,
  todayKey: string = getTodayKey(),
): boolean {
  if (daily.mode === "curated") {
    return Boolean(daily.curated?.entries?.[todayKey]?.id);
  }
  const weekly = daily.weekly;
  if (!weekly) {
    return false;
  }
  if (daily.mode === "weekly") {
    return Boolean(weekly[weekdayForKey(todayKey)]?.id);
  }
  return DAY_KEYS.some(key => Boolean(weekly[key]?.id));
}

// True when today already carries a "real" completion status. "incomplete" and
// "touched" are deliberately excluded — both mean the item still needs doing.
export function hasStatusForDay(
  daily: Pick<Daily, "completions">,
  todayKey: string = getTodayKey(),
): boolean {
  const status = findStatusForDate(daily, todayKey);
  return status !== null && status !== "incomplete" && status !== "touched";
}

// Whether a routine still has something to do today: scheduled for today and
// its weekly target (if any) not yet met for the current window.
export function hasTaskForDay(
  daily: Pick<
    Daily,
    "weekly" | "curated" | "mode" | "completions" | "weeklyTarget"
  >,
  todayKey: string,
  window: WeekTargetWindow,
): boolean {
  return (
    isScheduledForDay(daily, todayKey)
    && !isWeeklyTargetMet(daily, todayKey, window)
  );
}

// Split a routine into the dashboard's two buckets: "now" = has a task today
// and not yet given a real status; "done" = everything else (already statused,
// or nothing to do today).
export function classifyDaily(
  daily: Pick<
    Daily,
    "weekly" | "curated" | "mode" | "completions" | "weeklyTarget"
  >,
  todayKey: string,
  window: WeekTargetWindow,
): "now" | "done" {
  return hasTaskForDay(daily, todayKey, window)
    && !hasStatusForDay(daily, todayKey)
    ? "now"
    : "done";
}

export function getDailyProgressPercent(daily: Daily): number {
  const course = daily.resource;
  if (course) {
    const total = course.progressTotal ?? 0;
    const current = course.progressCurrent ?? 0;
    return total > 0 ? current / total : 0;
  }
  const taskProgress = daily.task?.progress;
  if (taskProgress) {
    const total = taskProgress.todosTotal + taskProgress.resourcesTotal;
    const done = taskProgress.todosComplete + taskProgress.resourcesUsed;
    return total > 0 ? done / total : 0;
  }
  return 0;
}

// Carry a completion's already-baked schedule snapshot forward across status /
// note edits, so the frozen text survives and the server doesn't re-bake it to a
// later schedule. entryParts and entryRef are baked together (coupled presence),
// so both ride along. Absent on first save → the server bakes them then.
function carryBakedSnapshot(
  existing: Daily["completions"][number] | undefined,
): Pick<Daily["completions"][number], "entryParts" | "entryRef"> | object {
  return existing?.entryParts !== undefined
    ? {
      entryParts: existing.entryParts,
      entryRef: existing.entryRef,
    }
    : {};
}

// How recent a logged entry must be for a status re-update to re-snapshot its
// scheduled task. Re-updating a recent entry re-bakes it (so a changed/renamed
// task is reflected in the entries log); older entries stay frozen for historical
// accuracy.
export const REBAKE_WINDOW_DAYS = 7;

// Whether `dateKey` (a "YYYY-MM-DD" key) is recent enough — today, in the future,
// or within REBAKE_WINDOW_DAYS in the past — that re-updating its status should
// drop the frozen snapshot and let the server re-bake to the current schedule.
// Both keys are compared in UTC to match the rest of the daily date math.
export function isWithinRebakeWindow(
  dateKey: string,
  todayKey: string,
): boolean {
  const diffDays = Math.round(
    (Date.parse(`${todayKey}T00:00:00Z`) - Date.parse(`${dateKey}T00:00:00Z`))
    / 86_400_000,
  );
  return diffDays <= REBAKE_WINDOW_DAYS;
}

// Decide whether to keep an entry's frozen snapshot or drop it so the server
// re-bakes. With no recency reference we keep frozen (safe default); given
// `todayKey`, recent entries drop the snapshot (re-bake), older ones stay frozen.
function rebakeOrCarry(
  existing: Daily["completions"][number] | undefined,
  dateKey: string,
  todayKey: string | undefined,
): Pick<Daily["completions"][number], "entryParts"> | object {
  if (todayKey !== undefined && isWithinRebakeWindow(dateKey, todayKey)) {
    return {};
  }
  return carryBakedSnapshot(existing);
}

export function withCompletion(
  daily: Daily,
  dateKey: string,
  status: DailyCompletionStatus | null,
  todayKey?: string,
): Daily["completions"] {
  const others = daily.completions.filter(c => c.date !== dateKey);
  const existing = daily.completions.find(c => c.date === dateKey);
  const carry = rebakeOrCarry(existing, dateKey, todayKey);
  if (status === null) {
    if (existing?.note) {
      return [
        ...others,
        {
          date: dateKey,
          note: existing.note,
          ...carry,
        },
      ];
    }
    return others;
  }
  return [
    ...others,
    {
      date: dateKey,
      status,
      ...(existing?.note
        ? {
          note: existing.note,
        }
        : {}),
      ...carry,
    },
  ];
}

export function withCompletionNote(
  daily: Daily,
  dateKey: string,
  note: string | null,
): Daily["completions"] {
  const others = daily.completions.filter(c => c.date !== dateKey);
  const existing = daily.completions.find(c => c.date === dateKey);
  const carry = carryBakedSnapshot(existing);
  const trimmed = note?.trim() ?? "";
  if (!trimmed) {
    if (existing?.status) {
      return [
        ...others,
        {
          date: dateKey,
          status: existing.status,
          ...carry,
        },
      ];
    }
    return others;
  }
  return [
    ...others,
    {
      date: dateKey,
      ...(existing?.status
        ? {
          status: existing.status,
        }
        : {}),
      note: trimmed,
      ...carry,
    },
  ];
}
