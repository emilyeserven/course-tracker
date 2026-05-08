import type { DailyCompletion, DailyCompletionStatus, LearningLogEntry } from "@emstack/types/src";

interface ManualEntryRow {
  id: string;
  date: string | Date | null;
  description: string;
  link: string | null;
}

interface DailySource {
  id: string;
  name: string;
  completions: DailyCompletion[];
  courseId: string;
  courseName: string;
}

function dateString(value: string | Date | null): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  return "";
}

function isMeaningfulCompletion(c: DailyCompletion): boolean {
  if (c.status && c.status !== "incomplete") {
    return true;
  }
  if (c.note && c.note.trim()) {
    return true;
  }
  return false;
}

function describeCompletion(daily: DailySource, c: DailyCompletion): string {
  const note = c.note?.trim();
  if (note) {
    return `${daily.name} — ${note}`;
  }
  return daily.name;
}

export function buildDomainLearningLog(
  manualEntries: ManualEntryRow[],
  dailySources: DailySource[],
): LearningLogEntry[] {
  const manual: LearningLogEntry[] = manualEntries.map(entry => ({
    id: entry.id,
    source: "manual" as const,
    date: dateString(entry.date),
    description: entry.description,
    link: entry.link ?? null,
  }));

  const seenDailyKeys = new Set<string>();
  const fromDailies: LearningLogEntry[] = [];
  for (const daily of dailySources) {
    for (const completion of daily.completions ?? []) {
      if (!isMeaningfulCompletion(completion)) {
        continue;
      }
      const date = dateString(completion.date);
      if (!date) {
        continue;
      }
      const dedupeKey = `${daily.id}:${date}`;
      if (seenDailyKeys.has(dedupeKey)) {
        continue;
      }
      seenDailyKeys.add(dedupeKey);
      fromDailies.push({
        id: dedupeKey,
        source: "daily",
        date,
        description: describeCompletion(daily, completion),
        link: null,
        dailyId: daily.id,
        dailyName: daily.name,
        courseId: daily.courseId,
        courseName: daily.courseName,
        status: (completion.status ?? null) as DailyCompletionStatus | null,
      });
    }
  }

  const combined = [...manual, ...fromDailies];
  combined.sort((a, b) => {
    if (a.date === b.date) {
      if (a.source === b.source) {
        return 0;
      }
      return a.source === "manual" ? -1 : 1;
    }
    return a.date < b.date ? 1 : -1;
  });
  return combined;
}
