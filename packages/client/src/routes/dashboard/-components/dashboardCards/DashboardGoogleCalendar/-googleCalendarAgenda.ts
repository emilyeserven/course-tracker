import type { GoogleCalendarEvent } from "@emstack/types";

// Pure agenda helpers for the Google Calendar card — no React/component
// imports, so they stay unit-testable (same convention as -dashboardTileMeta).

export interface EventDayGroup {
  // Local calendar date key (YYYY-MM-DD) the group is keyed on.
  dateKey: string;
  // Display heading: "Today", "Tomorrow", or e.g. "Mon, Jun 15".
  label: string;
  events: GoogleCalendarEvent[];
}

/** Local YYYY-MM-DD for a Date. */
function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The local calendar date an event falls on. All-day events already carry a
 * date-only start; timed events are bucketed by their local date. */
function eventDateKey(event: GoogleCalendarEvent): string {
  if (event.allDay) return event.start.slice(0, 10);
  return toDateKey(new Date(event.start));
}

/** "Mon, Jun 15" for a YYYY-MM-DD key, parsed as a local date (avoids the UTC
 * shift `new Date("2026-06-15")` would introduce). */
function weekdayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Clock time for a timed event, or "All day". */
export function formatEventTime(event: GoogleCalendarEvent): string {
  if (event.allDay) return "All day";
  const date = new Date(event.start);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Bucket already-sorted events into day groups for the agenda, labelling the
 * current and next day as "Today"/"Tomorrow". `now` is injected so the result
 * is deterministic (and testable).
 */
export function groupEventsByDay(
  events: GoogleCalendarEvent[],
  now: Date,
): EventDayGroup[] {
  const todayKey = toDateKey(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowKey = toDateKey(tomorrow);

  const groups = new Map<string, GoogleCalendarEvent[]>();
  for (const event of events) {
    const key = eventDateKey(event);
    const existing = groups.get(key);
    if (existing) existing.push(event);
    else groups.set(key, [event]);
  }

  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dateKey, dayEvents]) => ({
      dateKey,
      label:
        dateKey === todayKey
          ? "Today"
          : dateKey === tomorrowKey
            ? "Tomorrow"
            : weekdayLabel(dateKey),
      events: dayEvents,
    }));
}
