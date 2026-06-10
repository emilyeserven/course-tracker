import type { RoutineWeekly } from "@emstack/types/src";

import { describe, expect, test } from "vitest";

import { rowsToWeekly, weeklyToRows } from "./weekly";

describe("weekly schedule item notes", () => {
  test("weeklyToRows surfaces an item's notes", () => {
    const weekly: RoutineWeekly = {
      1: {
        type: "task",
        id: "task-1",
        notes: "focus on the subjunctive",
      },
    };
    const monday = weeklyToRows(weekly).find(r => r.day === "1");
    expect(monday?.notes).toBe("focus on the subjunctive");
  });

  test("weeklyToRows defaults a missing note to an empty string", () => {
    const weekly: RoutineWeekly = {
      2: {
        type: "resource",
        id: "res-1",
      },
    };
    const tuesday = weeklyToRows(weekly).find(r => r.day === "2");
    expect(tuesday?.notes).toBe("");
  });

  test("rowsToWeekly preserves a non-empty note", () => {
    const weekly: RoutineWeekly = {
      3: {
        type: "task",
        id: "task-9",
        notes: "do exercises 1-5",
      },
    };
    expect(rowsToWeekly(weeklyToRows(weekly))[3]).toEqual({
      type: "task",
      id: "task-9",
      notes: "do exercises 1-5",
    });
  });

  test("rowsToWeekly omits an empty note from the stored item", () => {
    const weekly: RoutineWeekly = {
      4: {
        type: "task",
        id: "task-2",
      },
    };
    const stored = rowsToWeekly(weeklyToRows(weekly))[4];
    expect(stored).toEqual({
      type: "task",
      id: "task-2",
    });
    expect(stored).not.toHaveProperty("notes");
  });

  test("a weekly grid survives a rows round-trip with notes intact", () => {
    const original: RoutineWeekly = {
      1: {
        type: "task",
        id: "task-1",
        notes: "warm up",
      },
      5: {
        type: "freeform",
        id: "Read a chapter",
        notes: "",
      },
    };
    const restored = rowsToWeekly(weeklyToRows(original));
    expect(restored[1]).toEqual({
      type: "task",
      id: "task-1",
      notes: "warm up",
    });
    // The empty note is dropped, the freeform item is otherwise intact.
    expect(restored[5]).toEqual({
      type: "freeform",
      id: "Read a chapter",
    });
  });
});
