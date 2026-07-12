import assert from "node:assert";
import { test } from "node:test";

import type { DailyProjectionRow } from "../utils/dailyProjection.ts";
import { mapDaily } from "../utils/dailyProjection.ts";

// A fully-populated, minimal-but-valid row. Tests spread this and override the
// field under test so each case stays focused on one behavior.
const baseRow: DailyProjectionRow = {
  id: "daily-1",
  name: "Practice Spanish",
  location: "Desk",
  description: "Daily drills",
  completions: [],
  status: "active",
  criteria: {},
  taskId: null,
  task: null,
};

// --- toTaskBlock (via mapDaily) ---

test("mapDaily yields a null task block when no task is linked", () => {
  assert.strictEqual(mapDaily({
    ...baseRow,
    task: null,
  }).task, null);
});

test("mapDaily counts only completed todos", () => {
  const result = mapDaily({
    ...baseRow,
    task: {
      id: "task-1",
      name: "Conjugation set",
      todos: [
        {
          id: "td-1",
          status: "goal",
        },
        {
          id: "td-2",
          status: "incomplete",
        },
        {
          id: "td-3",
          status: "exceeded",
        },
      ],
    },
  });

  assert.deepStrictEqual(result.task, {
    id: "task-1",
    name: "Conjugation set",
    progress: {
      todosTotal: 3,
      todosComplete: 2,
    },
  });
});

test("mapDaily defaults task progress counts to 0 when arrays are absent", () => {
  const result = mapDaily({
    ...baseRow,
    task: {
      id: "task-2",
      name: "Reading",
    },
  });

  assert.deepStrictEqual(result.task, {
    id: "task-2",
    name: "Reading",
    progress: {
      todosTotal: 0,
      todosComplete: 0,
    },
  });
});

// --- mapDaily passthrough & defaults ---

test("mapDaily passes scalar fields through unchanged", () => {
  const result = mapDaily({
    ...baseRow,
    id: "daily-9",
    name: "Stretch",
    location: "Gym",
    description: "Loosen up",
  });

  assert.strictEqual(result.id, "daily-9");
  assert.strictEqual(result.name, "Stretch");
  assert.strictEqual(result.location, "Gym");
  assert.strictEqual(result.description, "Loosen up");
});

test("mapDaily applies defaults for null completions, status and criteria", () => {
  const result = mapDaily({
    ...baseRow,
    completions: null,
    status: null,
    criteria: null,
  } as unknown as DailyProjectionRow);

  assert.deepStrictEqual(result.completions, []);
  assert.strictEqual(result.status, "active");
  assert.deepStrictEqual(result.criteria, {});
});

test("mapDaily preserves provided completions, status and criteria", () => {
  const completions = [
    {
      date: "2026-06-14",
      status: "goal" as const,
    },
  ];
  const criteria = {
    goal: "10 minutes",
  };
  const result = mapDaily({
    ...baseRow,
    completions,
    status: "paused",
    criteria,
  });

  assert.deepStrictEqual(result.completions, completions);
  assert.strictEqual(result.status, "paused");
  assert.deepStrictEqual(result.criteria, criteria);
});

test("mapDaily defaults the task id to null", () => {
  const result = mapDaily({
    ...baseRow,
    taskId: undefined,
  } as unknown as DailyProjectionRow);

  assert.strictEqual(result.taskId, null);
});

test("mapDaily carries through a provided task id", () => {
  const result = mapDaily({
    ...baseRow,
    taskId: "task-7",
  });

  assert.strictEqual(result.taskId, "task-7");
});
