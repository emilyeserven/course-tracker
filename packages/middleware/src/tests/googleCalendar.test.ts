import assert from "node:assert";
import { test } from "node:test";

import {
  expandIcsToEvents,
  mergeAndSortEvents,
} from "../services/googleCalendarIcs.ts";

const FEED = {
  id: "feed-1",
  name: "Personal",
  color: "#ff0000",
};

// Build a minimal VCALENDAR wrapper around one or more VEVENT blocks.
function calendar(...vevents: string[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//test//test//EN",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

test("expandIcsToEvents maps a single timed event in range", () => {
  const ics = calendar(
    [
      "BEGIN:VEVENT",
      "UID:evt-1",
      "DTSTAMP:20260613T000000Z",
      "DTSTART:20260615T090000Z",
      "DTEND:20260615T100000Z",
      "SUMMARY:One off",
      "LOCATION:Room 4",
      "END:VEVENT",
    ].join("\r\n"),
  );
  const events = expandIcsToEvents(
    ics,
    new Date("2026-06-14T00:00:00Z"),
    new Date("2026-06-28T00:00:00Z"),
    FEED,
  );
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].summary, "One off");
  assert.strictEqual(events[0].allDay, false);
  assert.strictEqual(events[0].location, "Room 4");
  assert.strictEqual(events[0].calendarName, "Personal");
  assert.strictEqual(events[0].start, "2026-06-15T09:00:00.000Z");
});

test("expandIcsToEvents flags all-day events with a date-only start", () => {
  const ics = calendar(
    [
      "BEGIN:VEVENT",
      "UID:evt-allday",
      "DTSTAMP:20260613T000000Z",
      "DTSTART;VALUE=DATE:20260616",
      "DTEND;VALUE=DATE:20260617",
      "SUMMARY:Holiday",
      "END:VEVENT",
    ].join("\r\n"),
  );
  const events = expandIcsToEvents(
    ics,
    new Date("2026-06-14T00:00:00Z"),
    new Date("2026-06-28T00:00:00Z"),
    FEED,
  );
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].allDay, true);
  assert.strictEqual(events[0].start, "2026-06-16");
});

test("expandIcsToEvents expands a weekly recurrence within the window", () => {
  // Weekly on Mondays starting 2026-06-15; a 21-day window should yield 3.
  const ics = calendar(
    [
      "BEGIN:VEVENT",
      "UID:evt-weekly",
      "DTSTAMP:20260613T000000Z",
      "DTSTART:20260615T120000Z",
      "DTEND:20260615T123000Z",
      "RRULE:FREQ=WEEKLY;BYDAY=MO",
      "SUMMARY:Standup",
      "END:VEVENT",
    ].join("\r\n"),
  );
  const events = expandIcsToEvents(
    ics,
    new Date("2026-06-14T00:00:00Z"),
    new Date("2026-07-05T00:00:00Z"),
    FEED,
  );
  assert.strictEqual(events.length, 3);
  assert.ok(events.every(e => e.summary === "Standup"));
  // Distinct occurrences a week apart.
  const starts = events.map(e => e.start).sort();
  assert.deepStrictEqual(starts, [
    "2026-06-15T12:00:00.000Z",
    "2026-06-22T12:00:00.000Z",
    "2026-06-29T12:00:00.000Z",
  ]);
});

test("mergeAndSortEvents orders chronologically and is pure", () => {
  const base = {
    summary: "event",
    calendarName: "c",
    calendarColor: null,
    end: "",
    allDay: false,
    location: null,
    htmlLink: "",
  };
  const input = [
    {
      ...base,
      id: "late",
      calendarId: "b",
      start: "2026-06-15T15:00:00Z",
    },
    {
      ...base,
      id: "early",
      calendarId: "a",
      start: "2026-06-15T08:00:00Z",
    },
    {
      ...base,
      id: "allday",
      calendarId: "a",
      allDay: true,
      start: "2026-06-15",
    },
  ];
  const sorted = mergeAndSortEvents(input);
  assert.deepStrictEqual(sorted.map(e => e.id), ["allday", "early", "late"]);
  assert.strictEqual(input[0].id, "late");
});
