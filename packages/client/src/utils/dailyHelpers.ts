import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

function getDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayKey(): string {
  return getDateKey(new Date());
}

export function shiftDateKey(key: string, deltaDays: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export function findStatusForDate(
  daily: Daily,
  dateKey: string,
): DailyCompletionStatus | null {
  return daily.completions.find(c => c.date === dateKey)?.status ?? null;
}

export function getCurrentChain(daily: Daily, todayKey: string = getTodayKey()): number {
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

export function getTotalCompletedDays(daily: Daily): number {
  return daily.completions.filter(
    c => c.status && c.status !== "incomplete",
  ).length;
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
    const dayLabel = labelFormat === "mmdd"
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

export function withCompletion(
  daily: Daily,
  dateKey: string,
  status: DailyCompletionStatus | null,
): Daily["completions"] {
  const others = daily.completions.filter(c => c.date !== dateKey);
  const existing = daily.completions.find(c => c.date === dateKey);
  if (status === null) {
    if (existing?.note) {
      return [
        ...others,
        {
          date: dateKey,
          note: existing.note,
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
  const trimmed = note?.trim() ?? "";
  if (!trimmed) {
    if (existing?.status) {
      return [
        ...others,
        {
          date: dateKey,
          status: existing.status,
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
    },
  ];
}
