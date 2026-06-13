import assert from "node:assert";
import { test } from "node:test";

import {
  mapEvent,
  mergeAndSortEvents,
} from "../services/googleCalendarMap.ts";

test("mapEvent flags all-day events and resolves date-only start/end", () => {
  const event = mapEvent(
    {
      id: "e1",
      summary: "  Holiday  ",
      start: {
        date: "2026-06-15",
      },
      end: {
        date: "2026-06-16",
      },
    },
    "cal-1",
    "Personal",
    "#ff0000",
  );
  assert.strictEqual(event.allDay, true);
  assert.strictEqual(event.start, "2026-06-15");
  assert.strictEqual(event.end, "2026-06-16");
  assert.strictEqual(event.summary, "Holiday");
  assert.strictEqual(event.calendarId, "cal-1");
  assert.strictEqual(event.calendarName, "Personal");
  assert.strictEqual(event.calendarColor, "#ff0000");
  assert.strictEqual(event.location, null);
});

test("mapEvent prefers dateTime for timed events and falls back for a missing title", () => {
  const event = mapEvent(
    {
      id: "e2",
      location: " Room 4 ",
      start: {
        dateTime: "2026-06-15T09:00:00Z",
      },
      end: {
        dateTime: "2026-06-15T10:00:00Z",
      },
    },
    "cal-2",
    "Work",
    null,
  );
  assert.strictEqual(event.allDay, false);
  assert.strictEqual(event.start, "2026-06-15T09:00:00Z");
  assert.strictEqual(event.summary, "(no title)");
  assert.strictEqual(event.location, "Room 4");
});

test("mergeAndSortEvents orders chronologically across calendars and is pure", () => {
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
  // All-day (midnight) sorts first, then the two timed events ascending.
  assert.deepStrictEqual(sorted.map(e => e.id), ["allday", "early", "late"]);
  // Input is not mutated.
  assert.strictEqual(input[0].id, "late");
});
