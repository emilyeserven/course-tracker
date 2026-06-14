import type {
  DailyCompletion,
  RoutineCurated,
  RoutineWeekly,
} from "@emstack/types";

import assert from "node:assert";
import { test } from "node:test";

import {
  routineInteractionsForResource,
  type RoutineForInteractions,
} from "../utils/routineInteractions.ts";

const RESOURCE_ID = "res-1";

// A weekly routine with frozen entryRef/entryParts on each completion (the path
// taken once the bake has run). Different days point at different things.
function weeklyRoutine(completions: DailyCompletion[]): RoutineForInteractions {
  const weekly: RoutineWeekly = {};
  return {
    id: "rt-weekly",
    name: "Daily practice",
    mode: "weekly",
    weekly,
    curated: null,
    completions,
  };
}

test("matches a completion whose frozen ref is the resource directly", () => {
  const routine = weeklyRoutine([
    {
      date: "2026-06-10",
      status: "goal",
      entryParts: {
        prependText: "Read",
        name: "Pimsleur",
        appendText: null,
      },
      entryRef: {
        type: "resource",
        id: RESOURCE_ID,
      },
    },
  ]);

  const out = routineInteractionsForResource(routine, RESOURCE_ID, new Set());
  assert.strictEqual(out.length, 1);
  assert.deepStrictEqual(out[0], {
    id: "rt-weekly:2026-06-10",
    routineId: "rt-weekly",
    routineName: "Daily practice",
    date: "2026-06-10",
    status: "goal",
    note: null,
    actionLabel: "Read Pimsleur",
    via: "resource",
  });
});

test("matches a completion whose frozen ref is a task linked to the resource", () => {
  const routine = weeklyRoutine([
    {
      date: "2026-06-11",
      status: "touched",
      note: "did half",
      entryParts: {
        prependText: null,
        name: "Grammar drills",
        appendText: null,
      },
      entryRef: {
        type: "task",
        id: "task-7",
      },
    },
  ]);

  const out = routineInteractionsForResource(
    routine,
    RESOURCE_ID,
    new Set(["task-7"]),
  );
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].via, "task");
  assert.strictEqual(out[0].note, "did half");
  assert.strictEqual(out[0].actionLabel, "Grammar drills");
});

test("excludes a task ref whose task is not linked to the resource", () => {
  const routine = weeklyRoutine([
    {
      date: "2026-06-11",
      status: "goal",
      entryRef: {
        type: "task",
        id: "task-other",
      },
    },
  ]);
  const out = routineInteractionsForResource(
    routine,
    RESOURCE_ID,
    new Set(["task-7"]),
  );
  assert.deepStrictEqual(out, []);
});

test("excludes completions with no status, and a null ref (nothing scheduled)", () => {
  const routine = weeklyRoutine([
    // No status → not a real completion.
    {
      date: "2026-06-12",
      entryRef: {
        type: "resource",
        id: RESOURCE_ID,
      },
    },
    // Nothing was scheduled that day at bake time.
    {
      date: "2026-06-13",
      status: "goal",
      entryRef: null,
    },
  ]);
  const out = routineInteractionsForResource(routine, RESOURCE_ID, new Set());
  assert.deepStrictEqual(out, []);
});

test("counts every status, including incomplete and freeze", () => {
  const routine = weeklyRoutine(
    (["incomplete", "freeze"] as const).map(status => ({
      date: status === "incomplete" ? "2026-06-14" : "2026-06-15",
      status,
      entryRef: {
        type: "resource" as const,
        id: RESOURCE_ID,
      },
    })),
  );
  const out = routineInteractionsForResource(routine, RESOURCE_ID, new Set());
  assert.deepStrictEqual(
    out.map(r => r.status).sort(),
    ["freeze", "incomplete"],
  );
});

test("falls back to live schedule resolution for unbaked (no entryRef) completions", () => {
  // Curated mode keyed by exact date — deterministic regardless of weekday.
  const curated: RoutineCurated = {
    endDate: "2026-06-20",
    entries: {
      "2026-06-16": {
        type: "resource",
        id: RESOURCE_ID,
      },
    },
  };
  const routine: RoutineForInteractions = {
    id: "rt-curated",
    name: "Curated run",
    mode: "curated",
    weekly: null,
    curated,
    // entryRef absent → must resolve live from curated.entries.
    completions: [
      {
        date: "2026-06-16",
        status: "goal",
      },
    ],
  };

  const out = routineInteractionsForResource(routine, RESOURCE_ID, new Set());
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].via, "resource");
  // No baked entryParts → actionLabel is null (UI falls back to routine name).
  assert.strictEqual(out[0].actionLabel, null);
});
