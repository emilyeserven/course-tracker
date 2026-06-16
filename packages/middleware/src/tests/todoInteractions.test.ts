import assert from "node:assert";
import { test } from "node:test";

import type { TaskForTodoInteractions } from "../utils/todoInteractions.ts";
import { todoInteractionsForResource } from "../utils/todoInteractions.ts";

function task(
  todos: TaskForTodoInteractions["todos"],
): TaskForTodoInteractions {
  return {
    id: "task-1",
    name: "Spanish list",
    todos,
  };
}

test("includes only touched todos linking the resource, dated by due date", () => {
  const result = todoInteractionsForResource(
    task([
      {
        id: "t1",
        name: "Drill verbs",
        status: "goal",
        dueDate: "2026-06-10",
        note: "good session",
        resourceId: "res-1",
      },
      // Wrong resource — excluded.
      {
        id: "t2",
        name: "Other",
        status: "goal",
        dueDate: "2026-06-11",
        note: null,
        resourceId: "res-2",
      },
      // Untouched (incomplete) — excluded.
      {
        id: "t3",
        name: "Not started",
        status: "incomplete",
        dueDate: "2026-06-12",
        note: null,
        resourceId: "res-1",
      },
    ]),
    "res-1",
    "2026-06-16",
  );

  assert.deepStrictEqual(result, [
    {
      id: "t1",
      taskId: "task-1",
      taskName: "Spanish list",
      todoId: "t1",
      todoName: "Drill verbs",
      date: "2026-06-10",
      status: "goal",
      note: "good session",
      via: "resource",
    },
  ]);
});

test("falls back to today when a touched todo has no due date", () => {
  const result = todoInteractionsForResource(
    task([
      {
        id: "t1",
        name: "Review",
        status: "touched",
        dueDate: null,
        note: null,
        resourceId: "res-1",
      },
    ]),
    "res-1",
    "2026-06-16",
  );

  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].date, "2026-06-16");
  assert.strictEqual(result[0].status, "touched");
});
