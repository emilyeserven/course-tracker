import { isTodoComplete } from "@emstack/types";

import { currentDateKey } from "./routineWeekday.ts";

import type { Daily, DailyCompletionStatus } from "@emstack/types";

// The task + todo columns the Do Now todo projection reads.
export interface TaskForTodoDailies {
  id: string;
  name: string;
  todos: {
    id: string;
    name: string;
    status: DailyCompletionStatus;
    dueDate: string | null;
    location: string | null;
    resourceId: string | null;
    moduleGroupId: string | null;
    moduleId: string | null;
  }[];
}

// A todo surfaces on the dashboard when it is due today, or overdue and not yet
// done. Done-today todos are still emitted so they land in "Done for the Day".
function shouldSurface(
  todo: TaskForTodoDailies["todos"][number],
  todayKey: string,
): boolean {
  if (!todo.dueDate) {
    return false;
  }
  if (todo.dueDate === todayKey) {
    return true;
  }
  return todo.dueDate < todayKey && !isTodoComplete(todo.status);
}

// Project a Task List's due/overdue todos into Daily rows for the Do Now /
// Done-for-the-Day tracker. Each row is shaped as a synthetic single-day curated
// routine keyed at today, so the existing classifyDaily / isScheduledForDay /
// hasStatusForDay machinery buckets it with no special-casing. `kind: "todo"`
// + taskId/todoId tell the client to write status changes back to the todo
// rather than a routine. task.progress carries the parent Task List's todo
// counts so the row shows Task List progress.
export function todoDailiesForTask(
  task: TaskForTodoDailies,
  todayKey: string = currentDateKey(),
): Daily[] {
  const todosTotal = task.todos.length;
  const todosComplete = task.todos.filter(t => isTodoComplete(t.status)).length;

  return task.todos
    .filter(todo => shouldSurface(todo, todayKey))
    .map((todo) => {
      const entry = todo.resourceId
        ? {
          type: "resource" as const,
          id: todo.resourceId,
          moduleGroupId: todo.moduleGroupId,
          moduleId: todo.moduleId,
        }
        : {
          type: "freeform" as const,
          id: todo.name,
        };
      return {
        id: `todo:${todo.id}`,
        kind: "todo",
        todoId: todo.id,
        name: task.name,
        actionLabel: todo.name,
        actionParts: {
          name: todo.name,
        },
        location: todo.location,
        completions: [
          {
            date: todayKey,
            status: todo.status,
          },
        ],
        status: "active",
        taskId: task.id,
        task: {
          id: task.id,
          name: task.name,
          progress: {
            todosTotal,
            todosComplete,
            resourcesTotal: 0,
            resourcesUsed: 0,
          },
        },
        moduleGroupId: todo.moduleGroupId,
        moduleId: todo.moduleId,
        // Synthetic single-day curated schedule so isScheduledForDay(today) is
        // true and the row classifies like a curated routine.
        mode: "curated",
        curated: {
          endDate: todayKey,
          entries: {
            [todayKey]: entry,
          },
        },
      } satisfies Daily;
    });
}
