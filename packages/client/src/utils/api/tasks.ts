import type { Daily, DailyCompletionStatus, Task, TaskType } from "@emstack/types";

import { createEntityClient, fetchJson, putJson } from "./client";

const tasksApi = createEntityClient<Task>("tasks", "task");
const taskTypesApi = createEntityClient<TaskType>(
  "task-types",
  "task type",
);

export const fetchTasks = tasksApi.list;
export const fetchSingleTask = tasksApi.get;
export const upsertTask = tasksApi.upsert;
export const createTask = tasksApi.create;
export const deleteSingleTask = tasksApi.delete;

// Task List todos that are due today (or overdue and unfinished), projected into
// the Daily shape for the Do Now / Done-for-the-Day tracker.
export const fetchTaskDailies = () =>
  fetchJson<Daily[]>("/api/tasks/dailies");

// Surgical single-todo status update used by the Do Now tracker.
export async function updateTodoStatus(
  taskId: string,
  todoId: string,
  status: DailyCompletionStatus,
): Promise<{ id: string;
  status: DailyCompletionStatus; }> {
  return putJson(
    `/api/tasks/${taskId}/todos/${todoId}/status`,
    {
      status,
    },
    "Failed to update todo status",
  );
}

export const fetchTaskTypes = taskTypesApi.list;
export const upsertTaskType = taskTypesApi.upsert;
export const createTaskType = taskTypesApi.create;
export const deleteSingleTaskType = taskTypesApi.delete;
