import type { GoogleCalendarEvent } from "@emstack/types";

// Pure event-shaping helpers, kept free of `@/` imports (no DB) so the Node test
// runner can load them directly — same convention as the routes' `*Rows.ts`
// files. The networked service in googleCalendar.ts re-uses these.

export interface RawEvent {
  id?: string;
  summary?: string | null;
  location?: string | null;
  htmlLink?: string | null;
  status?: string | null;
  start?: { date?: string | null;
    dateTime?: string | null; } | null;
  end?: { date?: string | null;
    dateTime?: string | null; } | null;
}

/** Map a raw Calendar API event onto the slim client shape. */
export function mapEvent(
  raw: RawEvent,
  calendarId: string,
  calendarName: string,
  calendarColor: string | null,
): GoogleCalendarEvent {
  const allDay = Boolean(raw.start?.date && !raw.start?.dateTime);
  const start = raw.start?.dateTime ?? raw.start?.date ?? "";
  const end = raw.end?.dateTime ?? raw.end?.date ?? start;
  return {
    id: raw.id ?? `${calendarId}:${start}`,
    calendarId,
    calendarName,
    calendarColor,
    summary: raw.summary?.trim() || "(no title)",
    start,
    end,
    allDay,
    location: raw.location?.trim() || null,
    htmlLink: raw.htmlLink ?? "",
  };
}

/** Chronological merge of events across calendars. */
export function mergeAndSortEvents(
  events: GoogleCalendarEvent[],
): GoogleCalendarEvent[] {
  const startMs = (e: GoogleCalendarEvent) => {
    const ms = Date.parse(e.start);
    return Number.isNaN(ms) ? 0 : ms;
  };
  return events.slice().sort((a, b) => startMs(a) - startMs(b));
}
