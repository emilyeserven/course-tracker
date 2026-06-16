import type { Daily, DailyCompletion, RoutineWeekly } from "@emstack/types";

import { describe, expect, test } from "vitest";

import {
  classifyDaily,
  dailyLinkTooltip,
  findStatusForDate,
  getCompletedDaysThisWeek,
  getCurrentChain,
  getDailyProgressPercent,
  getDaysBetweenFirstAndLastEntry,
  getLastEntryDate,
  getLongestStreak,
  getRecentDays,
  getReferenceDateKey,
  getTodayKey,
  getTotalCompletedDays,
  hasStatusForDay,
  hasTaskForDay,
  isScheduledForDay,
  isWeeklyTargetMet,
  isWithinRebakeWindow,
  REBAKE_WINDOW_DAYS,
  shiftDateKey,
  withCompletion,
  withCompletionNote,
} from "./dailyHelpers.ts";

function makeDaily(overrides: Partial<Daily> = {}): Daily {
  return {
    id: "daily-1",
    name: "A daily",
    completions: [],
    ...overrides,
  };
}

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

  test("curated mode: true only when that exact date has an entry", () => {
    const curated = {
      endDate: "2026-06-12",
      entries: {
        [TODAY]: {
          type: "task" as const,
          id: "task-1",
        },
      },
    };
    expect(isScheduledForDay({
      curated,
      mode: "curated",
    }, TODAY)).toBe(true);
    expect(isScheduledForDay({
      curated,
      mode: "curated",
    }, "2026-06-12")).toBe(false);
  });
});

describe("hasStatusForDay", () => {
  test("goal/exceeded/freeze count; touched, incomplete and no-entry do not", () => {
    const real = (status: DailyCompletion["status"]) =>
      hasStatusForDay({
        completions: [{
          date: TODAY,
          status,
        }],
      }, TODAY);
    expect(real("goal")).toBe(true);
    expect(real("exceeded")).toBe(true);
    expect(real("freeze")).toBe(true);
    expect(real("touched")).toBe(false);
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

  test("touched today stays in now", () => {
    expect(
      classifyDaily({
        weekly: thursdayWeekly,
        mode: "weekly",
        completions: [{
          date: TODAY,
          status: "touched",
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

describe("getTodayKey", () => {
  test("returns a YYYY-MM-DD key matching the local date", () => {
    const key = getTodayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(key).toBe(expected);
  });
});

describe("dailyLinkTooltip", () => {
  test("returns the entity name when it differs from the daily title", () => {
    expect(dailyLinkTooltip("Read a book", "Daily reading", "Go to task")).toBe(
      "Read a book",
    );
  });

  test("returns the go-label when the titles match (case/space-insensitively)", () => {
    expect(dailyLinkTooltip("  Daily Reading ", "daily reading", "Go")).toBe(
      "Go",
    );
  });
});

describe("shiftDateKey", () => {
  test("shifts a date key forward and back across month boundaries", () => {
    expect(shiftDateKey("2026-06-11", 1)).toBe("2026-06-12");
    expect(shiftDateKey("2026-06-11", -1)).toBe("2026-06-10");
    expect(shiftDateKey("2026-06-30", 1)).toBe("2026-07-01");
    expect(shiftDateKey("2026-01-01", -1)).toBe("2025-12-31");
  });

  test("is a no-op for a zero delta", () => {
    expect(shiftDateKey("2026-06-11", 0)).toBe("2026-06-11");
  });
});

describe("findStatusForDate", () => {
  const daily = {
    completions: [
      {
        date: "2026-06-10",
        status: "goal" as const,
      },
    ],
  };

  test("returns the status for a matching date", () => {
    expect(findStatusForDate(daily, "2026-06-10")).toBe("goal");
  });

  test("returns null when no completion matches", () => {
    expect(findStatusForDate(daily, "2026-06-11")).toBeNull();
  });
});

describe("getCurrentChain", () => {
  test("counts a run ending today", () => {
    const completions: DailyCompletion[] = [
      {
        date: "2026-06-09",
        status: "goal",
      },
      {
        date: "2026-06-10",
        status: "goal",
      },
      {
        date: "2026-06-11",
        status: "exceeded",
      },
    ];
    expect(getCurrentChain({
      completions,
    }, "2026-06-11")).toBe(3);
  });

  test("still counts when today is blank but yesterday is done", () => {
    const completions: DailyCompletion[] = [
      {
        date: "2026-06-09",
        status: "goal",
      },
      {
        date: "2026-06-10",
        status: "goal",
      },
    ];
    expect(getCurrentChain({
      completions,
    }, "2026-06-11")).toBe(2);
  });

  test("returns 0 when neither today nor yesterday is done", () => {
    const completions: DailyCompletion[] = [
      {
        date: "2026-06-08",
        status: "goal",
      },
    ];
    expect(getCurrentChain({
      completions,
    }, "2026-06-11")).toBe(0);
  });

  test("ignores incomplete and unset statuses", () => {
    const completions: DailyCompletion[] = [
      {
        date: "2026-06-11",
        status: "incomplete",
      },
      {
        date: "2026-06-10",
      },
    ];
    expect(getCurrentChain({
      completions,
    }, "2026-06-11")).toBe(0);
  });
});

describe("getTotalCompletedDays", () => {
  test("counts only real (non-incomplete) statuses", () => {
    const completions: DailyCompletion[] = [
      {
        date: "2026-06-09",
        status: "goal",
      },
      {
        date: "2026-06-10",
        status: "incomplete",
      },
      {
        date: "2026-06-11",
        status: "freeze",
      },
      {
        date: "2026-06-12",
      },
    ];
    expect(getTotalCompletedDays({
      completions,
    })).toBe(2);
  });
});

describe("getLongestStreak", () => {
  test("finds the longest consecutive run regardless of order", () => {
    const daily = makeDaily({
      completions: [
        {
          date: "2026-06-11",
          status: "goal",
        },
        {
          date: "2026-06-09",
          status: "goal",
        },
        {
          date: "2026-06-10",
          status: "goal",
        },
        // gap, then a shorter run
        {
          date: "2026-06-13",
          status: "exceeded",
        },
        {
          date: "2026-06-14",
          status: "goal",
        },
      ],
    });
    expect(getLongestStreak(daily)).toBe(3);
  });

  test("returns 0 when there are no real completions", () => {
    expect(getLongestStreak(makeDaily())).toBe(0);
    expect(
      getLongestStreak(
        makeDaily({
          completions: [{
            date: "2026-06-11",
            status: "incomplete",
          }],
        }),
      ),
    ).toBe(0);
  });
});

describe("getLastEntryDate", () => {
  test("returns the latest entry date irrespective of order or status", () => {
    const daily = makeDaily({
      completions: [
        {
          date: "2026-06-09",
          status: "goal",
        },
        {
          date: "2026-06-12",
          status: "incomplete",
        },
        {
          date: "2026-06-10",
        },
      ],
    });
    expect(getLastEntryDate(daily)).toBe("2026-06-12");
  });

  test("returns null with no completions", () => {
    expect(getLastEntryDate(makeDaily())).toBeNull();
  });
});

describe("getDaysBetweenFirstAndLastEntry", () => {
  test("returns the inclusive day span between first and last entry", () => {
    const daily = makeDaily({
      completions: [
        {
          date: "2026-06-10",
          status: "goal",
        },
        {
          date: "2026-06-01",
          status: "goal",
        },
        {
          date: "2026-06-05",
        },
      ],
    });
    // 2026-06-01 .. 2026-06-10 inclusive = 10 days.
    expect(getDaysBetweenFirstAndLastEntry(daily)).toBe(10);
  });

  test("is 1 for a single entry and 0 for none", () => {
    expect(
      getDaysBetweenFirstAndLastEntry(
        makeDaily({
          completions: [{
            date: "2026-06-05",
            status: "goal",
          }],
        }),
      ),
    ).toBe(1);
    expect(getDaysBetweenFirstAndLastEntry(makeDaily())).toBe(0);
  });
});

describe("getReferenceDateKey", () => {
  test("returns today when the daily is not complete", () => {
    const daily = makeDaily({
      status: "active",
      completions: [{
        date: "2026-06-01",
        status: "goal",
      }],
    });
    expect(getReferenceDateKey(daily, "2026-06-11")).toBe("2026-06-11");
  });

  test("returns the last entry date for a completed daily", () => {
    const daily = makeDaily({
      status: "complete",
      completions: [
        {
          date: "2026-06-01",
          status: "goal",
        },
        {
          date: "2026-06-08",
          status: "goal",
        },
      ],
    });
    expect(getReferenceDateKey(daily, "2026-06-11")).toBe("2026-06-08");
  });

  test("falls back to today for a completed daily with no entries", () => {
    const daily = makeDaily({
      status: "complete",
    });
    expect(getReferenceDateKey(daily, "2026-06-11")).toBe("2026-06-11");
  });
});

describe("getRecentDays", () => {
  test("returns `count` days ending today, oldest first", () => {
    const daily = makeDaily({
      completions: [{
        date: "2026-06-11",
        status: "goal",
      }],
    });
    const days = getRecentDays(daily, 3, "2026-06-11");
    expect(days.map(d => d.dateKey)).toEqual([
      "2026-06-09",
      "2026-06-10",
      "2026-06-11",
    ]);
    expect(days.map(d => d.dayLabel)).toEqual(["Tue", "Wed", "Thu"]);
    expect(days.map(d => d.isToday)).toEqual([false, false, true]);
    expect(days[2].status).toBe("goal");
    expect(days[0].status).toBeNull();
  });

  test("supports the mm/dd label format", () => {
    const days = getRecentDays(makeDaily(), 2, "2026-06-11", "mmdd");
    expect(days.map(d => d.dayLabel)).toEqual(["06/10", "06/11"]);
  });
});

describe("getDailyProgressPercent", () => {
  test("uses the linked resource progress when present", () => {
    const daily = makeDaily({
      resource: {
        id: "r-1",
        name: "Course",
        progressCurrent: 3,
        progressTotal: 4,
      },
    });
    expect(getDailyProgressPercent(daily)).toBe(0.75);
  });

  test("guards against a zero resource total", () => {
    const daily = makeDaily({
      resource: {
        id: "r-1",
        name: "Course",
        progressCurrent: 0,
        progressTotal: 0,
      },
    });
    expect(getDailyProgressPercent(daily)).toBe(0);
  });

  test("falls back to task todo/resource progress", () => {
    const daily = makeDaily({
      task: {
        id: "t-1",
        name: "Task",
        progress: {
          todosTotal: 2,
          todosComplete: 1,
          resourcesTotal: 2,
          resourcesUsed: 2,
        },
      },
    });
    // (1 + 2) / (2 + 2) = 0.75
    expect(getDailyProgressPercent(daily)).toBe(0.75);
  });

  test("returns 0 when nothing is linked", () => {
    expect(getDailyProgressPercent(makeDaily())).toBe(0);
  });
});

describe("withCompletion", () => {
  test("adds a status entry for a new date", () => {
    const daily = makeDaily();
    expect(withCompletion(daily, "2026-06-11", "goal")).toEqual([
      {
        date: "2026-06-11",
        status: "goal",
      },
    ]);
  });

  test("replaces the existing entry for the date, preserving its note", () => {
    const daily = makeDaily({
      completions: [
        {
          date: "2026-06-11",
          status: "touched",
          note: "kept",
        },
        {
          date: "2026-06-10",
          status: "goal",
        },
      ],
    });
    const next = withCompletion(daily, "2026-06-11", "exceeded");
    expect(next).toContainEqual({
      date: "2026-06-11",
      status: "exceeded",
      note: "kept",
    });
    expect(next).toContainEqual({
      date: "2026-06-10",
      status: "goal",
    });
    expect(next).toHaveLength(2);
  });

  test("clearing a status drops the entry but keeps a note-only row", () => {
    const withNote = makeDaily({
      completions: [{
        date: "2026-06-11",
        status: "goal",
        note: "hi",
      }],
    });
    expect(withCompletion(withNote, "2026-06-11", null)).toEqual([
      {
        date: "2026-06-11",
        note: "hi",
      },
    ]);

    const noNote = makeDaily({
      completions: [{
        date: "2026-06-11",
        status: "goal",
      }],
    });
    expect(withCompletion(noNote, "2026-06-11", null)).toEqual([]);
  });

  test("carries a baked entryParts snapshot forward with no recency reference", () => {
    const daily = makeDaily({
      completions: [{
        date: "2026-06-11",
        status: "touched",
        entryParts: {
          prependText: "Review",
          name: "Spanish flashcards",
          appendText: null,
        },
      }],
    });
    // Without a `todayKey` reference we keep the frozen snapshot (safe default).
    expect(withCompletion(daily, "2026-06-11", "goal")).toEqual([
      {
        date: "2026-06-11",
        status: "goal",
        entryParts: {
          prependText: "Review",
          name: "Spanish flashcards",
          appendText: null,
        },
      },
    ]);
  });

  test("drops the baked snapshot when re-updating a recent entry (re-bake)", () => {
    const daily = makeDaily({
      completions: [{
        date: "2026-06-11",
        status: "touched",
        entryParts: {
          prependText: "Review",
          name: "Spanish flashcards",
          appendText: null,
        },
      }],
    });
    // 2026-06-11 is within REBAKE_WINDOW_DAYS of 2026-06-14, so the snapshot is
    // dropped (entryParts omitted) and the server re-bakes to the current schedule.
    expect(withCompletion(daily, "2026-06-11", "goal", "2026-06-14")).toEqual([
      {
        date: "2026-06-11",
        status: "goal",
      },
    ]);
  });

  test("keeps the baked snapshot when re-updating an older entry (frozen)", () => {
    const daily = makeDaily({
      completions: [{
        date: "2026-06-01",
        status: "touched",
        entryParts: {
          prependText: "Review",
          name: "Spanish flashcards",
          appendText: null,
        },
      }],
    });
    // 2026-06-01 is beyond REBAKE_WINDOW_DAYS of 2026-06-14, so it stays frozen.
    expect(withCompletion(daily, "2026-06-01", "goal", "2026-06-14")).toEqual([
      {
        date: "2026-06-01",
        status: "goal",
        entryParts: {
          prependText: "Review",
          name: "Spanish flashcards",
          appendText: null,
        },
      },
    ]);
  });
});

describe("isWithinRebakeWindow", () => {
  test("today and future dates are within the window", () => {
    expect(isWithinRebakeWindow("2026-06-14", "2026-06-14")).toBe(true);
    expect(isWithinRebakeWindow("2026-06-20", "2026-06-14")).toBe(true);
  });

  test("a past date exactly at the window edge is included", () => {
    const edge = shiftDateKey("2026-06-14", -REBAKE_WINDOW_DAYS);
    expect(isWithinRebakeWindow(edge, "2026-06-14")).toBe(true);
  });

  test("a past date beyond the window is excluded", () => {
    const beyond = shiftDateKey("2026-06-14", -(REBAKE_WINDOW_DAYS + 1));
    expect(isWithinRebakeWindow(beyond, "2026-06-14")).toBe(false);
  });
});

describe("withCompletionNote", () => {
  test("adds a note entry for a new date", () => {
    expect(withCompletionNote(makeDaily(), "2026-06-11", "wrote some")).toEqual([
      {
        date: "2026-06-11",
        note: "wrote some",
      },
    ]);
  });

  test("trims the note and preserves an existing status", () => {
    const daily = makeDaily({
      completions: [{
        date: "2026-06-11",
        status: "goal",
      }],
    });
    expect(withCompletionNote(daily, "2026-06-11", "  noted  ")).toEqual([
      {
        date: "2026-06-11",
        status: "goal",
        note: "noted",
      },
    ]);
  });

  test("an empty note drops the entry but keeps a status-only row", () => {
    const withStatus = makeDaily({
      completions: [{
        date: "2026-06-11",
        status: "goal",
        note: "old",
      }],
    });
    expect(withCompletionNote(withStatus, "2026-06-11", "   ")).toEqual([
      {
        date: "2026-06-11",
        status: "goal",
      },
    ]);

    const noteOnly = makeDaily({
      completions: [{
        date: "2026-06-11",
        note: "old",
      }],
    });
    expect(withCompletionNote(noteOnly, "2026-06-11", null)).toEqual([]);
  });
});
