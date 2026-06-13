import type { GoogleCalendarEvent } from "@emstack/types";

import { describe, expect, test } from "vitest";

import { groupEventsByDay } from "./-googleCalendarAgenda";

function allDayEvent(
  id: string,
  date: string,
  overrides: Partial<GoogleCalendarEvent> = {},
): GoogleCalendarEvent {
  return {
    id,
    calendarId: "cal-1",
    calendarName: "Personal",
    calendarColor: null,
    summary: id,
    start: date,
    end: date,
    allDay: true,
    location: null,
    htmlLink: "",
    ...overrides,
  };
}

describe("groupEventsByDay", () => {
  // Use all-day (date-only) events so grouping is timezone-independent.
  const now = new Date(2026, 5, 15); // 2026-06-15 (month is 0-based)

  test("labels the current and next day as Today/Tomorrow", () => {
    const groups = groupEventsByDay(
      [allDayEvent("a", "2026-06-15"), allDayEvent("b", "2026-06-16")],
      now,
    );
    expect(groups.map(g => g.label)).toEqual(["Today", "Tomorrow"]);
  });

  test("labels later days with a weekday/month/day heading", () => {
    const groups = groupEventsByDay([allDayEvent("c", "2026-06-17")], now);
    expect(groups[0].label).toBe("Wed, Jun 17");
  });

  test("buckets multiple events onto the same day and orders days ascending", () => {
    const groups = groupEventsByDay(
      [
        allDayEvent("late", "2026-06-17"),
        allDayEvent("today-1", "2026-06-15"),
        allDayEvent("today-2", "2026-06-15"),
      ],
      now,
    );
    expect(groups.map(g => g.dateKey)).toEqual(["2026-06-15", "2026-06-17"]);
    expect(groups[0].events.map(e => e.id)).toEqual(["today-1", "today-2"]);
  });

  test("returns no groups for an empty event list", () => {
    expect(groupEventsByDay([], now)).toEqual([]);
  });
});
