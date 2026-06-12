import type { DailyCompletion, RoutineWeekly } from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  classifyDaily,
  getCompletedDaysThisWeek,
  hasStatusForDay,
  hasTaskForDay,
  isScheduledForDay,
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

// TODAY (2026-06-11) is a Thursday → Date.getDay() key "4".
const thursdayWeekly: RoutineWeekly = {
  4: {
    type: "freeform",
    id: "thursday-thing",
  },
};
const fridayWeekly: RoutineWeekly = {
  5: {
    type: "freeform",
    id: "friday-thing",
  },
};

describe("isScheduledForDay", () => {
  test("weekly mode: true only on the scheduled weekday", () => {
    expect(isScheduledForDay({
      weekly: thursdayWeekly,
      mode: "weekly",
    }, TODAY)).toBe(true);
    expect(isScheduledForDay({
      weekly: fridayWeekly,
      mode: "weekly",
    }, TODAY)).toBe(false);
  });

  test("daily mode: true whenever any grid entry exists, ignoring weekday", () => {
    expect(isScheduledForDay({
      weekly: fridayWeekly,
      mode: "daily",
    }, TODAY)).toBe(true);
    expect(isScheduledForDay({
      weekly: {},
      mode: "daily",
    }, TODAY)).toBe(false);
  });

  test("no grid is never scheduled", () => {
    expect(isScheduledForDay({
      weekly: null,
      mode: "weekly",
    }, TODAY)).toBe(false);
  });
});

describe("hasStatusForDay", () => {
  test("real statuses count; incomplete and no-entry do not", () => {
    const real = (status: DailyCompletion["status"]) =>
      hasStatusForDay({
        completions: [{
          date: TODAY,
          status,
        }],
      }, TODAY);
    expect(real("goal")).toBe(true);
    expect(real("exceeded")).toBe(true);
    expect(real("touched")).toBe(true);
    expect(real("freeze")).toBe(true);
    expect(real("incomplete")).toBe(false);
    expect(hasStatusForDay({
      completions: [],
    }, TODAY)).toBe(false);
  });
});

describe("hasTaskForDay", () => {
  const goalDays: DailyCompletion[] = [
    {
      date: "2026-06-07",
      status: "goal",
    },
    {
      date: "2026-06-10",
      status: "goal",
    },
  ];

  test("scheduled today with no target → has a task", () => {
    expect(
      hasTaskForDay({
        weekly: thursdayWeekly,
        mode: "weekly",
        completions: [],
        weeklyTarget: null,
      }, TODAY, "sunday"),
    ).toBe(true);
  });

  test("weekly off-day → no task", () => {
    expect(
      hasTaskForDay({
        weekly: fridayWeekly,
        mode: "weekly",
        completions: [],
        weeklyTarget: null,
      }, TODAY, "sunday"),
    ).toBe(false);
  });

  test("daily mode with a met weekly target → no task", () => {
    expect(
      hasTaskForDay({
        weekly: thursdayWeekly,
        mode: "daily",
        completions: goalDays,
        weeklyTarget: 2,
      }, TODAY, "sunday"),
    ).toBe(false);
    // Same data, higher target not yet met → still has a task.
    expect(
      hasTaskForDay({
        weekly: thursdayWeekly,
        mode: "daily",
        completions: goalDays,
        weeklyTarget: 5,
      }, TODAY, "sunday"),
    ).toBe(true);
  });
});

describe("classifyDaily", () => {
  test("scheduled today and not yet statused → now", () => {
    expect(
      classifyDaily({
        weekly: thursdayWeekly,
        mode: "weekly",
        completions: [],
        weeklyTarget: null,
      }, TODAY, "sunday"),
    ).toBe("now");
  });

  test("an explicit incomplete today stays in now", () => {
    expect(
      classifyDaily({
        weekly: thursdayWeekly,
        mode: "weekly",
        completions: [{
          date: TODAY,
          status: "incomplete",
        }],
        weeklyTarget: null,
      }, TODAY, "sunday"),
    ).toBe("now");
  });

  test("a real status today → done", () => {
    expect(
      classifyDaily({
        weekly: thursdayWeekly,
        mode: "weekly",
        completions: [{
          date: TODAY,
          status: "goal",
        }],
        weeklyTarget: null,
      }, TODAY, "sunday"),
    ).toBe("done");
  });

  test("no task today (weekly off-day) → done", () => {
    expect(
      classifyDaily({
        weekly: fridayWeekly,
        mode: "weekly",
        completions: [],
        weeklyTarget: null,
      }, TODAY, "sunday"),
    ).toBe("done");
  });
});
