import type { RoutineReferenceItem, RoutineWeekly } from "@emstack/types";

import assert from "node:assert";
import { test } from "node:test";

import {
  activeEntry,
  currentWeekday,
  representativeEntry,
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
