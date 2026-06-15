import type {
  RoutineCurated,
  RoutineReferenceItem,
  RoutineWeekly,
} from "@emstack/types";

import assert from "node:assert";
import { test } from "node:test";

import {
  activeEntry,
  curatedEntry,
  currentDateKey,
  currentWeekday,
  entryForCompletionDate,
  entryToCompletionParts,
  entryToCompletionRef,
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

const wednesdayResource: RoutineReferenceItem = {
  type: "resource",
  id: "res-wed",
};

// Scheduled Monday ("1") and Wednesday ("3"); Tuesday ("2") is unscheduled.
const weekly: RoutineWeekly = {
  1: mondayTask,
  3: wednesdayResource,
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
  assert.strictEqual(activeEntry(weekly, "weekly", "3"), wednesdayResource);
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

test("entryToCompletionParts freezes resolved name + affixes (the baked snapshot)", () => {
  const taskNames = new Map([["task-mon", "Spanish flashcards"]]);
  const resourceNames = new Map([["res-wed", "Pimsleur"]]);

  // Task: resolved name with prepend/append carried through.
  assert.deepStrictEqual(
    entryToCompletionParts(mondayTask, taskNames, resourceNames),
    {
      prependText: "Review",
      name: "Spanish flashcards",
      appendText: "for 10 minutes",
    },
  );
  // Resource without affixes → null affixes.
  assert.deepStrictEqual(
    entryToCompletionParts(wednesdayResource, taskNames, resourceNames),
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
      resourceNames,
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
      resourceNames,
    ),
    {
      prependText: null,
      name: "task-gone",
      appendText: null,
    },
  );
  // Nothing scheduled → null.
  assert.strictEqual(
    entryToCompletionParts(null, taskNames, resourceNames),
    null,
  );
});

test("entryToCompletionParts freezes the module/group name for a narrowed resource", () => {
  const taskNames = new Map<string, string>();
  const resourceNames = new Map([["res-1", "Duolingo Spanish"]]);
  const moduleNames = new Map([["mod-1", "Basics 1"]]);
  const moduleGroupNames = new Map([["grp-1", "Unit 1"]]);

  // A specific module → the module name stands in for the resource name.
  assert.deepStrictEqual(
    entryToCompletionParts(
      {
        type: "resource",
        id: "res-1",
        moduleId: "mod-1",
      },
      taskNames,
      resourceNames,
      moduleNames,
      moduleGroupNames,
    ),
    {
      prependText: null,
      name: "Basics 1",
      appendText: null,
    },
  );

  // A module group → the group name stands in.
  assert.deepStrictEqual(
    entryToCompletionParts(
      {
        type: "resource",
        id: "res-1",
        moduleGroupId: "grp-1",
      },
      taskNames,
      resourceNames,
      moduleNames,
      moduleGroupNames,
    ),
    {
      prependText: null,
      name: "Unit 1",
      appendText: null,
    },
  );

  // No narrowing → the resource name stands.
  assert.deepStrictEqual(
    entryToCompletionParts(
      {
        type: "resource",
        id: "res-1",
      },
      taskNames,
      resourceNames,
      moduleNames,
      moduleGroupNames,
    ),
    {
      prependText: null,
      name: "Duolingo Spanish",
      appendText: null,
    },
  );
});

test("entryToCompletionRef freezes the scheduled item's kind + id", () => {
  // Task / resource entries keep their type + id (affixes are dropped — the ref
  // is for matching by id, not display).
  assert.deepStrictEqual(entryToCompletionRef(mondayTask), {
    type: "task",
    id: "task-mon",
  });
  assert.deepStrictEqual(entryToCompletionRef(wednesdayResource), {
    type: "resource",
    id: "res-wed",
  });
  // Nothing scheduled → null.
  assert.strictEqual(entryToCompletionRef(null), null);
});
