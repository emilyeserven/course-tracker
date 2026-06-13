import ical from "node-ical";

import type { CalendarFeed, GoogleCalendarEvent } from "@emstack/types";

// Pure ICS → event helpers. Imports only node-ical + types (no `@/`), so the
// Node test runner can load them directly. node-ical's expandRecurringEvent
// handles RRULE expansion, EXDATE exclusions, RECURRENCE-ID overrides and the
// DST/timezone corrections for us.

// Identifying/display bits of a feed (the secret URL is not needed here).
export type FeedMeta = Pick<CalendarFeed, "id" | "name" | "color">;

/** node-ical returns either a plain string or a { val, params } object. */
function paramVal(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    value
    && typeof value === "object"
    && "val" in value
    && typeof (value as { val: unknown }).val === "string"
  ) {
    return (value as { val: string }).val;
  }
  return "";
}

/** Local-agnostic YYYY-MM-DD for an all-day date (node-ical stores these at
 * UTC midnight), so the date doesn't drift across timezones. */
function dateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildEvent(
  start: Date,
  end: Date,
  summary: unknown,
  location: unknown,
  url: unknown,
  allDay: boolean,
  uid: string,
  feed: FeedMeta,
): GoogleCalendarEvent {
  const startStr = allDay ? dateOnlyString(start) : start.toISOString();
  const endStr = allDay ? dateOnlyString(end) : end.toISOString();
  const title = paramVal(summary).trim();
  const loc = paramVal(location).trim();
  return {
    id: `${feed.id}:${uid}:${startStr}`,
    calendarId: feed.id,
    calendarName: feed.name,
    calendarColor: feed.color ?? null,
    summary: title || "(no title)",
    start: startStr,
    end: endStr,
    allDay,
    location: loc || null,
    htmlLink: typeof url === "string" ? url : "",
  };
}

/**
 * Expand a single feed's ICS text into events that fall within [from, to],
 * flattening recurrences. Cancelled events are dropped.
 */
export function expandIcsToEvents(
  icsText: string,
  from: Date,
  to: Date,
  feed: FeedMeta,
): GoogleCalendarEvent[] {
  const data = ical.sync.parseICS(icsText);
  const events: GoogleCalendarEvent[] = [];

  for (const key of Object.keys(data)) {
    const comp = data[key];
    if (!comp || comp.type !== "VEVENT") continue;
    const ev = comp;
    if (ev.status === "CANCELLED") continue;

    if (ev.rrule) {
      const instances = ical.expandRecurringEvent(ev, {
        from,
        to,
      });
      for (const inst of instances) {
        if (inst.event.status === "CANCELLED") continue;
        events.push(
          buildEvent(
            inst.start,
            inst.end,
            inst.summary ?? inst.event.summary,
            inst.event.location,
            inst.event.url,
            inst.isFullDay,
            ev.uid,
            feed,
          ),
        );
      }
      continue;
    }

    // Non-recurring: include when it overlaps the window.
    const start = ev.start;
    if (!start) continue;
    const end = ev.end ?? start;
    if (end < from || start > to) continue;
    events.push(
      buildEvent(
        start,
        end,
        ev.summary,
        ev.location,
        ev.url,
        ev.datetype === "date",
        ev.uid,
        feed,
      ),
    );
  }

  return events;
}

/** Chronological merge of events across feeds. */
export function mergeAndSortEvents(
  events: GoogleCalendarEvent[],
): GoogleCalendarEvent[] {
  const startMs = (e: GoogleCalendarEvent) => {
    const ms = Date.parse(e.start);
    return Number.isNaN(ms) ? 0 : ms;
  };
  return events.slice().sort((a, b) => startMs(a) - startMs(b));
}
