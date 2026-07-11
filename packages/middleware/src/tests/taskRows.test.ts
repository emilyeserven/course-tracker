import assert from "node:assert";
import { test } from "node:test";

import {
  buildResourceLinkRows,
  buildTagRows,
  buildTaskResourceRows,
  buildTaskRow,
  buildTodoRows,
} from "../routes/api/tasks/taskRows.ts";

function sequentialIds() {
  let n = 0;
  return () => `gen-${++n}`;
}

test("buildTaskRow normalizes optional fields", () => {
  assert.deepStrictEqual(
    buildTaskRow({
      name: "Task",
    }, "t1"),
    {
      id: "t1",
      name: "Task",
      description: null,
      dueDate: null,
      taskTypeId: null,
    },
  );
  // Empty-string ids collapse to null (|| semantics), description keeps "" (?? semantics).
  assert.deepStrictEqual(
    buildTaskRow({
      name: "Task",
      description: "",
      taskTypeId: "tt1",
    }, "t1"),
    {
      id: "t1",
      name: "Task",
      description: "",
      dueDate: null,
      taskTypeId: "tt1",
    },
  );
});

test("buildTagRows skips when undefined, clears on [], dedupes and positions", () => {
  assert.strictEqual(buildTagRows(undefined, "t1"), undefined);
  assert.deepStrictEqual(buildTagRows([], "t1"), []);
  assert.deepStrictEqual(buildTagRows(["a", "b", "a"], "t1"), [
    {
      taskId: "t1",
      tagId: "a",
      position: 0,
    },
    {
      taskId: "t1",
      tagId: "b",
      position: 1,
    },
  ]);
});

test("buildResourceLinkRows dedupes by full (resource, group, module) tuple", () => {
  assert.strictEqual(buildResourceLinkRows(undefined, "t1"), undefined);
  assert.deepStrictEqual(buildResourceLinkRows([], "t1"), []);

  const rows = buildResourceLinkRows(
    [
      {
        resourceId: "r1",
      },
      {
        resourceId: "r1",
        moduleId: "m1",
      },
      // exact duplicate of the first entry — dropped
      {
        resourceId: "r1",
        moduleGroupId: null,
        moduleId: null,
      },
      {
        resourceId: "r1",
        moduleGroupId: "g1",
      },
    ],
    "t1",
    sequentialIds(),
  );

  assert.deepStrictEqual(rows, [
    {
      id: "gen-1",
      taskId: "t1",
      resourceId: "r1",
      moduleGroupId: null,
      moduleId: null,
      position: 0,
    },
    {
      id: "gen-2",
      taskId: "t1",
      resourceId: "r1",
      moduleGroupId: null,
      moduleId: "m1",
      position: 1,
    },
    // position keeps the original array index (3), matching the
    // pre-extraction handler behavior where dedup skips an index.
    {
      id: "gen-3",
      taskId: "t1",
      resourceId: "r1",
      moduleGroupId: "g1",
      moduleId: null,
      position: 3,
    },
  ]);
});

test("buildTaskResourceRows keeps given ids, generates missing ones, gates narrowing on resourceId", () => {
  assert.strictEqual(buildTaskResourceRows(undefined, "t1"), undefined);

  const rows = buildTaskResourceRows(
    [
      {
        id: "existing",
        name: "Linked",
        resourceId: "r1",
        moduleGroupId: "g1",
        moduleId: "m1",
      },
      {
        name: "Freeform",
        url: "https://example.com",
        usedYet: true,
        // narrowing without a resourceId is dropped
        moduleGroupId: "g1",
        moduleId: "m1",
      },
    ],
    "t1",
    sequentialIds(),
  );

  assert.deepStrictEqual(rows, [
    {
      id: "existing",
      taskId: "t1",
      name: "Linked",
      url: null,
      usedYet: false,
      position: 0,
      resourceId: "r1",
      moduleGroupId: "g1",
      moduleId: "m1",
    },
    {
      id: "gen-1",
      taskId: "t1",
      name: "Freeform",
      url: "https://example.com",
      usedYet: true,
      position: 1,
      resourceId: null,
      moduleGroupId: null,
      moduleId: null,
    },
  ]);
});

test("buildTodoRows fills defaults and positions in order", () => {
  assert.strictEqual(buildTodoRows(undefined, "t1"), undefined);

  const rows = buildTodoRows(
    [
      {
        id: "",
        name: "First",
      },
      {
        id: "todo-2",
        name: "Second",
        status: "goal",
        url: "https://example.com",
        resourceId: "res-1",
        moduleId: "mod-1",
      },
    ],
    "t1",
    sequentialIds(),
  );

  assert.deepStrictEqual(rows, [
    {
      id: "gen-1",
      taskId: "t1",
      name: "First",
      status: "incomplete",
      dueDate: null,
      note: null,
      location: null,
      url: null,
      position: 0,
      resourceId: null,
      moduleGroupId: null,
      moduleId: null,
    },
    {
      id: "todo-2",
      taskId: "t1",
      name: "Second",
      status: "goal",
      dueDate: null,
      note: null,
      location: null,
      url: "https://example.com",
      position: 1,
      resourceId: "res-1",
      moduleGroupId: null,
      moduleId: "mod-1",
    },
  ]);
});
