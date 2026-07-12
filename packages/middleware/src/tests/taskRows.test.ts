import assert from "node:assert";
import { test } from "node:test";

import {
  buildTagRows,
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
    },
  ]);
});
