import assert from "node:assert";
import { test } from "node:test";

import type { TaskForTodoDailies } from "../utils/todoDailyProjection.ts";
import { todoDailiesForTask } from "../utils/todoDailyProjection.ts";

function todo(
  over: Partial<TaskForTodoDailies["todos"][number]> = {},
): TaskForTodoDailies["todos"][number] {
  return {
    id: "todo-1",
    name: "Do the thing",
    status: "incomplete",
    dueDate: null,
    location: null,
    resourceId: null,
    moduleGroupId: null,
    moduleId: null,
    ...over,
  };
}

function task(todos: TaskForTodoDailies["todos"]): TaskForTodoDailies {
  return {
    id: "task-1",
    name: "My Task List",
    todos,
  };
}

const TODAY = "2026-06-16";

test("surfaces due-today and overdue-unfinished todos, hides future and no-date", () => {
  const result = todoDailiesForTask(
    task([
      todo({
        id: "due-today",
        dueDate: TODAY,
      }),
      todo({
        id: "overdue",
        dueDate: "2026-06-10",
        status: "touched",
      }),
      // Overdue but done — hidden.
      todo({
        id: "overdue-done",
        dueDate: "2026-06-10",
        status: "goal",
      }),
      // Future — hidden.
      todo({
        id: "future",
        dueDate: "2026-06-20",
      }),
      // No due date — hidden.
      todo({
        id: "no-date",
      }),
    ]),
    TODAY,
  );

  assert.deepStrictEqual(
    result.map(d => d.todoId).sort(),
    ["due-today", "overdue"],
  );
});

test("projects a todo as a synthetic single-day curated daily with task progress", () => {
  const [daily] = todoDailiesForTask(
    task([
      todo({
        id: "a",
        dueDate: TODAY,
        status: "incomplete",
        resourceId: "res-1",
      }),
      todo({
        id: "b",
        status: "goal",
      }),
    ]),
    TODAY,
  );

  assert.strictEqual(daily.kind, "todo");
  assert.strictEqual(daily.id, "todo:a");
  assert.strictEqual(daily.todoId, "a");
  assert.strictEqual(daily.taskId, "task-1");
  assert.strictEqual(daily.mode, "curated");
  assert.strictEqual(daily.curated?.endDate, TODAY);
  // Synthetic entry keyed at today so it classifies as "now".
  assert.strictEqual(daily.curated?.entries[TODAY]?.id, "res-1");
  assert.strictEqual(daily.completions[0]?.date, TODAY);
  assert.strictEqual(daily.completions[0]?.status, "incomplete");
  // Parent Task List progress: 1 of 2 todos done (the "goal" one).
  assert.strictEqual(daily.task?.progress?.todosTotal, 2);
  assert.strictEqual(daily.task?.progress?.todosComplete, 1);
});
