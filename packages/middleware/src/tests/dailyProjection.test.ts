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
  moduleGroupId: null,
  moduleId: null,
  courseProvider: null,
  resource: null,
  task: null,
};

// --- toTaskBlock (via mapDaily) ---

test("mapDaily yields a null task block when no task is linked", () => {
  assert.strictEqual(mapDaily({
    ...baseRow,
    task: null,
  }).task, null);
});

test("mapDaily counts only completed todos and used resources", () => {
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
      resources: [
        {
          id: "tr-1",
          usedYet: true,
        },
        {
          id: "tr-2",
          usedYet: false,
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
      resourcesTotal: 2,
      resourcesUsed: 1,
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
      resourcesTotal: 0,
      resourcesUsed: 0,
    },
  });
});

// --- toResourceBlock (via mapDaily) ---

test("mapDaily omits the resource block when no resource is linked", () => {
  assert.strictEqual(mapDaily({
    ...baseRow,
    resource: null,
  }).resource, undefined);
});

test("mapDaily omits the resource block when id or name is missing", () => {
  assert.strictEqual(mapDaily({
    ...baseRow,
    resource: {
      id: "",
      name: "Has name, no id",
      progressCurrent: 1,
      progressTotal: 2,
    },
  }).resource, undefined);

  assert.strictEqual(mapDaily({
    ...baseRow,
    resource: {
      id: "res-1",
      name: "",
      progressCurrent: 1,
      progressTotal: 2,
    },
  }).resource, undefined);
});

test("mapDaily defaults resource progress to 0 when null", () => {
  const result = mapDaily({
    ...baseRow,
    resource: {
      id: "res-2",
      name: "Spanish reader",
      progressCurrent: null,
      progressTotal: null,
    },
  });

  assert.deepStrictEqual(result.resource, {
    id: "res-2",
    name: "Spanish reader",
    progressCurrent: 0,
    progressTotal: 0,
    tracksProgress: true,
  });
});

test("mapDaily carries through a resource that opts out of tracking", () => {
  const result = mapDaily({
    ...baseRow,
    resource: {
      id: "res-3",
      name: "Reference site",
      progressCurrent: null,
      progressTotal: null,
      tracksProgress: false,
    },
  });

  assert.strictEqual(result.resource?.tracksProgress, false);
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

test("mapDaily defaults the link ids to null", () => {
  const result = mapDaily({
    ...baseRow,
    taskId: undefined,
    moduleGroupId: undefined,
    moduleId: undefined,
  } as unknown as DailyProjectionRow);

  assert.strictEqual(result.taskId, null);
  assert.strictEqual(result.moduleGroupId, null);
  assert.strictEqual(result.moduleId, null);
});

test("mapDaily carries through provided link ids", () => {
  const result = mapDaily({
    ...baseRow,
    taskId: "task-7",
    moduleGroupId: "mg-3",
    moduleId: "m-5",
  });

  assert.strictEqual(result.taskId, "task-7");
  assert.strictEqual(result.moduleGroupId, "mg-3");
  assert.strictEqual(result.moduleId, "m-5");
});

// --- provider delegation (toProviderBlock) ---

test("mapDaily projects a present provider to the public {name, id} block", () => {
  const result = mapDaily({
    ...baseRow,
    courseProvider: {
      id: "prov-1",
      name: "Frontend Masters",
    },
  });

  assert.deepStrictEqual(result.provider, {
    name: "Frontend Masters",
    id: "prov-1",
  });
});

test("mapDaily omits the provider when courseProvider is null or unnamed", () => {
  assert.strictEqual(mapDaily({
    ...baseRow,
    courseProvider: null,
  }).provider, undefined);

  assert.strictEqual(mapDaily({
    ...baseRow,
    courseProvider: {
      id: "prov-2",
      name: null,
    },
  }).provider, undefined);
});
