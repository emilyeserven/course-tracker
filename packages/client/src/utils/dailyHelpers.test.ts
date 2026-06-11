import type { DailyCompletion } from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  getCompletedDaysThisWeek,
  isWeeklyTargetMet,
} from "./dailyHelpers.ts";

// 2026-06-11 is a Thursday. The three windows that contain it:
//   sunday   -> 2026-06-07 (Sun) … 2026-06-13 (Sat)
//   monday   -> 2026-06-08 (Mon) … 2026-06-14 (Sun)
//   rolling7 -> 2026-06-05 (Fri) … 2026-06-11 (Thu)
const TODAY = "2026-06-11";

const completions: DailyCompletion[] = [
  {
    date: "2026-06-05",
    status: "exceeded",
  }, // only rolling7
  {
    date: "2026-06-07",
    status: "goal",
  }, // sunday + rolling7
  {
    date: "2026-06-10",
    status: "goal",
  }, // all three windows
  {
    date: "2026-06-11",
    status: "touched",
  }, // never counts (not goal/exceeded)
];

describe("getCompletedDaysThisWeek", () => {
  test("counts goal/exceeded days inside each window", () => {
    expect(getCompletedDaysThisWeek({
      completions,
    }, TODAY, "sunday")).toBe(2);
    expect(getCompletedDaysThisWeek({
      completions,
    }, TODAY, "monday")).toBe(1);
    expect(getCompletedDaysThisWeek({
      completions,
    }, TODAY, "rolling7")).toBe(3);
  });

  test("ignores touched, freeze, incomplete and unset statuses", () => {
    const soft: DailyCompletion[] = [
      {
        date: "2026-06-10",
        status: "touched",
      },
      {
        date: "2026-06-09",
        status: "freeze",
      },
      {
        date: "2026-06-08",
        status: "incomplete",
      },
      {
        date: "2026-06-07",
      },
    ];
    expect(getCompletedDaysThisWeek({
      completions: soft,
    }, TODAY, "sunday"))
      .toBe(0);
  });
});

describe("isWeeklyTargetMet", () => {
  test("true once goal/exceeded days reach the target for the window", () => {
    expect(
      isWeeklyTargetMet({
        completions,
        weeklyTarget: 2,
      }, TODAY, "sunday"),
    ).toBe(true);
    expect(
      isWeeklyTargetMet({
        completions,
        weeklyTarget: 3,
      }, TODAY, "rolling7"),
    ).toBe(true);
  });

  test("false when the window's count is below the target", () => {
    expect(
      isWeeklyTargetMet({
        completions,
        weeklyTarget: 2,
      }, TODAY, "monday"),
    ).toBe(false);
  });

  test("no target (null/0/undefined) is never met", () => {
    expect(
      isWeeklyTargetMet({
        completions,
        weeklyTarget: null,
      }, TODAY, "rolling7"),
    ).toBe(false);
    expect(
      isWeeklyTargetMet({
        completions,
        weeklyTarget: 0,
      }, TODAY, "rolling7"),
    ).toBe(false);
    expect(
      isWeeklyTargetMet({
        completions,
      }, TODAY, "rolling7"),
    ).toBe(false);
  });
});
