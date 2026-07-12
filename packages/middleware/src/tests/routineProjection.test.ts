import type {
  RoutineCurated,
  RoutineReferenceItem,
  RoutineWeekly,
} from "@emstack/types";

import assert from "node:assert";
import { test } from "node:test";

import {
  activeBookmarkForEntry,
  activeEntry,
  curatedEntry,
  currentDateKey,
  currentWeekday,
  entryForCompletionDate,
  entryToCompletionParts,
  entryToCompletionRef,
  firstTaskBookmarkWithProgress,
  representativeEntry,
  weekdayForDateKey,
} from "../utils/routineWeekday.ts";

const mondayTask: RoutineReferenceItem = {
  type: "task",
  id: "task-mon",
  notes: "Focus on the subjunctive",
  prependText: "Review",
  appendText: "for 10 minutes",
};

const wednesdayBookmark: RoutineReferenceItem = {
  type: "bookmark",
  id: "bm-wed",
  title: "Pimsleur",
};

// Scheduled Monday ("1") and Wednesday ("3"); Tuesday ("2") is unscheduled.
const weekly: RoutineWeekly = {
  1: mondayTask,
  3: wednesdayBookmark,
};

const curatedTask: RoutineReferenceItem = {
  type: "task",
  id: "task-0615",
  prependText: "Read",
};

// Curated entries keyed by absolute date. 2026-06-15 is scheduled; 2026-06-16 is
// not.
const curated: RoutineCurated = {
  endDate: "2026-06-20",
  entries: {
    "2026-06-15": curatedTask,
  },
};

test("currentWeekday returns the Date.getDay() key", () => {
  // 2026-06-08 is a Monday → "1"; 2026-06-07 is a Sunday → "0".
  assert.strictEqual(currentWeekday(new Date("2026-06-08T12:00:00")), "1");
  assert.strictEqual(currentWeekday(new Date("2026-06-07T12:00:00")), "0");
});

test("representativeEntry returns the first populated day, null when empty", () => {
  assert.strictEqual(representativeEntry(weekly), mondayTask);
  assert.strictEqual(representativeEntry({}), null);
  assert.strictEqual(representativeEntry(null), null);
});

test("activeEntry returns the current weekday's entry for weekly routines", () => {
  assert.strictEqual(activeEntry(weekly, "weekly", "1"), mondayTask);
  assert.strictEqual(activeEntry(weekly, "weekly", "3"), wednesdayBookmark);
});

test("activeEntry returns null for an unscheduled weekday in weekly mode", () => {
  assert.strictEqual(activeEntry(weekly, "weekly", "2"), null);
});

test("activeEntry ignores the weekday for daily routines (uses representative)", () => {
  // Daily mode mirrors one entry across every day, so the first populated entry
  // represents it regardless of which weekday we ask for.
  assert.strictEqual(
    activeEntry(weekly, "daily", "2"),
    representativeEntry(weekly),
  );
  assert.strictEqual(activeEntry(weekly, "daily", "2"), mondayTask);
});

test("weekdayForDateKey returns the UTC weekday of a date key", () => {
  // 2026-06-15 is a Monday → "1"; 2026-06-14 is a Sunday → "0".
  assert.strictEqual(weekdayForDateKey("2026-06-15"), "1");
  assert.strictEqual(weekdayForDateKey("2026-06-14"), "0");
});

test("currentDateKey returns the UTC YYYY-MM-DD for a date", () => {
  assert.strictEqual(currentDateKey(new Date("2026-06-15T23:30:00Z")), "2026-06-15");
});

test("curatedEntry returns the date's entry, null when unscheduled", () => {
  assert.strictEqual(curatedEntry(curated, "2026-06-15"), curatedTask);
  assert.strictEqual(curatedEntry(curated, "2026-06-16"), null);
  assert.strictEqual(curatedEntry(null, "2026-06-15"), null);
});

test("entryForCompletionDate resolves weekly by weekday, curated by date, daily by representative", () => {
  // Weekly: 2026-06-15 is a Monday ("1") → Monday's entry; 2026-06-16 (Tuesday)
  // is unscheduled → null.
  assert.strictEqual(
    entryForCompletionDate("weekly", weekly, null, "2026-06-15"),
    mondayTask,
  );
  assert.strictEqual(
    entryForCompletionDate("weekly", weekly, null, "2026-06-16"),
    null,
  );
  // Curated: keyed by the exact date.
  assert.strictEqual(
    entryForCompletionDate("curated", {}, curated, "2026-06-15"),
    curatedTask,
  );
  assert.strictEqual(
    entryForCompletionDate("curated", {}, curated, "2026-06-16"),
    null,
  );
  // Daily: representative entry regardless of date.
  assert.strictEqual(
    entryForCompletionDate("daily", weekly, null, "2026-06-16"),
    mondayTask,
  );
});

test("activeBookmarkForEntry returns the bookmark only for a bookmark entry", () => {
  // Progress is driven strictly by today's scheduled entry: a bookmark entry
  // yields its id + cached title (trimmed, defaulting to "Bookmark").
  assert.deepStrictEqual(activeBookmarkForEntry(wednesdayBookmark), {
    id: "bm-wed",
    title: "Pimsleur",
  });
  assert.deepStrictEqual(
    activeBookmarkForEntry({
      type: "bookmark",
      id: "bm-untitled",
      title: "  ",
    }),
    {
      id: "bm-untitled",
      title: "Bookmark",
    },
  );
});

test("firstTaskBookmarkWithProgress picks the earliest positioned bookmark with progress", () => {
  const progress = new Map([
    ["bm-a", {
      current: 0,
      total: 0,
    }], // has a record but no real progress → skipped
    ["bm-b", {
      current: 5,
      total: 40,
    }],
    ["bm-c", {
      current: 10,
      total: 100,
    }],
  ]);
  // Out of order on input; bm-b (position 1) beats bm-c (position 2), and bm-a
  // (position 0) is skipped for having total 0.
  const result = firstTaskBookmarkWithProgress(
    [
      {
        bookmarkId: "bm-c",
        title: "C",
        position: 2,
      },
      {
        bookmarkId: "bm-a",
        title: "A",
        position: 0,
      },
      {
        bookmarkId: "bm-b",
        title: "B",
        position: 1,
      },
    ],
    progress,
  );
  assert.deepStrictEqual(result, {
    id: "bm-b",
    title: "B",
  });
});

test("firstTaskBookmarkWithProgress returns null when no bookmark has progress", () => {
  const progress = new Map([["bm-a", {
    current: 0,
    total: 0,
  }]]);
  assert.strictEqual(
    firstTaskBookmarkWithProgress(
      [
        {
          bookmarkId: "bm-a",
          title: "A",
          position: 0,
        },
        {
          bookmarkId: "bm-missing",
          title: "Missing",
          position: 1,
        },
      ],
      progress,
    ),
    null,
  );
  assert.strictEqual(firstTaskBookmarkWithProgress([], progress), null);
});

test("firstTaskBookmarkWithProgress falls back to a default title when blank", () => {
  const result = firstTaskBookmarkWithProgress(
    [
      {
        bookmarkId: "bm-a",
        title: "   ",
        position: 0,
      },
    ],
    new Map([["bm-a", {
      current: 3,
      total: 9,
    }]]),
  );
  assert.deepStrictEqual(result, {
    id: "bm-a",
    title: "Bookmark",
  });
});

test("activeBookmarkForEntry ignores task, freeform, and empty days", () => {
  // Task / freeform / unscheduled days get their progress elsewhere (the task's
  // to-dos or none) — never from a bookmark, and never from a categorical
  // bookmark connection, which this helper deliberately does not consult.
  assert.strictEqual(activeBookmarkForEntry(mondayTask), null);
  assert.strictEqual(
    activeBookmarkForEntry({
      type: "freeform",
      id: "Stretch",
    }),
    null,
  );
  assert.strictEqual(activeBookmarkForEntry(null), null);
});

test("entryToCompletionParts freezes resolved name + affixes (the baked snapshot)", () => {
  const taskNames = new Map([["task-mon", "Spanish flashcards"]]);

  // Task: resolved name with prepend/append carried through.
  assert.deepStrictEqual(
    entryToCompletionParts(mondayTask, taskNames),
    {
      prependText: "Review",
      name: "Spanish flashcards",
      appendText: "for 10 minutes",
    },
  );
  // Bookmark: the cached title on the entry IS the name (no affixes here).
  assert.deepStrictEqual(
    entryToCompletionParts(wednesdayBookmark, taskNames),
    {
      prependText: null,
      name: "Pimsleur",
      appendText: null,
    },
  );
  // Freeform: the entry id IS the name.
  assert.deepStrictEqual(
    entryToCompletionParts(
      {
        type: "freeform",
        id: "Stretch",
      },
      taskNames,
    ),
    {
      prependText: null,
      name: "Stretch",
      appendText: null,
    },
  );
  // Deleted task (not in the map) → falls back to its id.
  assert.deepStrictEqual(
    entryToCompletionParts(
      {
        type: "task",
        id: "task-gone",
      },
      taskNames,
    ),
    {
      prependText: null,
      name: "task-gone",
      appendText: null,
    },
  );
  // Nothing scheduled → null.
  assert.strictEqual(
    entryToCompletionParts(null, taskNames),
    null,
  );
});

test("entryToCompletionRef freezes the scheduled item's kind + id", () => {
  // Task / bookmark entries keep their type + id (affixes are dropped — the ref
  // is for matching by id, not display).
  assert.deepStrictEqual(entryToCompletionRef(mondayTask), {
    type: "task",
    id: "task-mon",
  });
  assert.deepStrictEqual(entryToCompletionRef(wednesdayBookmark), {
    type: "bookmark",
    id: "bm-wed",
  });
  // Nothing scheduled → null.
  assert.strictEqual(entryToCompletionRef(null), null);
});
