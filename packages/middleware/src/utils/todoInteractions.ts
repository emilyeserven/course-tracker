import { currentDateKey } from "./routineWeekday.ts";

import type { DailyCompletionStatus, TodoInteraction } from "@emstack/types";

// The task + todo columns the resource-interaction projection reads.
export interface TaskForTodoInteractions {
  id: string;
  name: string;
  todos: {
    id: string;
    name: string;
    status: DailyCompletionStatus;
    dueDate: string | null;
    note: string | null;
    resourceId: string | null;
  }[];
}

// Pure projection: a task's todos that link `resourceId` and have been acted on
// (any status other than the default "incomplete"). Each surfaces on the
// resource's Interactions tab dated by the todo's due date, or today when it has
// none. Returned unsorted.
export function todoInteractionsForResource(
  task: TaskForTodoInteractions,
  resourceId: string,
  todayKey: string = currentDateKey(),
): TodoInteraction[] {
  const out: TodoInteraction[] = [];
  for (const todo of task.todos ?? []) {
    if (todo.resourceId !== resourceId) {
      continue;
    }
    // Skip untouched todos — only logged completions belong in the interaction
    // history.
    if (todo.status === "incomplete") {
      continue;
    }
    out.push({
      id: todo.id,
      taskId: task.id,
      taskName: task.name,
      todoId: todo.id,
      todoName: todo.name,
      date: todo.dueDate ?? todayKey,
      status: todo.status,
      note: todo.note ?? null,
      via: "resource",
    });
  }
  return out;
}
