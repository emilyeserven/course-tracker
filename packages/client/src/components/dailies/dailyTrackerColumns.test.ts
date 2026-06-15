import type { DailyDayHeader } from "@/hooks/useDailyTracker";

import { describe, expect, it } from "vitest";

import {
  buildDailyTrackerColumns,
  DEFAULT_DAILY_TRACKER_COLUMNS,
  resolveDailyTrackerColumns,
} from "./dailyTrackerColumns";

const dayHeaders: DailyDayHeader[] = [
  {
    dateKey: "0101",
    label: "M",
    isToday: false,
  },
  {
    dateKey: "0102",
    label: "T",
    isToday: true,
  },
];

function columnIds(columns?: Parameters<typeof buildDailyTrackerColumns>[0]["columns"]) {
  return buildDailyTrackerColumns({
    dayHeaders,
    statusHeadClassName: "",
    columns,
  }).map(c => c.id);
}

describe("resolveDailyTrackerColumns", () => {
  it("defaults every toggleable column on except routine", () => {
    expect(resolveDailyTrackerColumns()).toEqual(DEFAULT_DAILY_TRACKER_COLUMNS);
    expect(DEFAULT_DAILY_TRACKER_COLUMNS.routine).toBe(false);
  });

  it("merges a partial override over the defaults", () => {
    const resolved = resolveDailyTrackerColumns({
      routine: true,
      location: false,
    });
    expect(resolved.routine).toBe(true);
    expect(resolved.location).toBe(false);
    expect(resolved.progress).toBe(true);
  });
});

describe("buildDailyTrackerColumns", () => {
  it("omits the routine column and keeps the rest by default", () => {
    const ids = columnIds();
    expect(ids).not.toContain("routine");
    expect(ids).toEqual([
      "progress",
      "name",
      "type",
      "cadence",
      "streak",
      "total",
      "comment",
      "today",
      "day-0101",
      "day-0102",
      "location",
    ]);
  });

  it("inserts the routine column right after the title when enabled", () => {
    const ids = columnIds({
      routine: true,
    });
    expect(ids.indexOf("routine")).toBe(ids.indexOf("name") + 1);
  });

  it("drops a toggled-off column's header", () => {
    expect(columnIds({
      type: false,
    })).not.toContain("type");
  });

  it("drops every recent-day column when days is off", () => {
    const ids = columnIds({
      days: false,
    });
    expect(ids).not.toContain("day-0101");
    expect(ids).not.toContain("day-0102");
  });

  it("always keeps the always-on title and today columns", () => {
    const ids = columnIds({
      progress: false,
      type: false,
      cadence: false,
      streak: false,
      total: false,
      comment: false,
      days: false,
      location: false,
    });
    expect(ids).toEqual(["name", "today"]);
  });
});
