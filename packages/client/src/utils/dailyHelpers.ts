import type { Daily, DailyCompletionStatus } from "@emstack/types/src";

export function getDateKey(date: Date = new Date()): string {
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
      .filter(c => c.status !== "incomplete")
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

const SHORT_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface RecentDay {
  dateKey: string;
  dayLabel: string;
  isToday: boolean;
  status: DailyCompletionStatus | null;
}

export function getRecentDays(
  daily: Daily,
  count = 7,
  todayKey: string = getTodayKey(),
): RecentDay[] {
  const days: RecentDay[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const dateKey = shiftDateKey(todayKey, -i);
    const date = new Date(`${dateKey}T00:00:00Z`);
    days.push({
      dateKey,
      dayLabel: SHORT_DAY_LABELS[date.getUTCDay()],
      isToday: dateKey === todayKey,
      status: findStatusForDate(daily, dateKey),
    });
  }
  return days;
}

export function withCompletion(
  daily: Daily,
  dateKey: string,
  status: DailyCompletionStatus | null,
): Daily["completions"] {
  const others = daily.completions.filter(c => c.date !== dateKey);
  if (status === null) {
    return others;
  }
  return [
    ...others,
    {
      date: dateKey,
      status,
    },
  ];
}
