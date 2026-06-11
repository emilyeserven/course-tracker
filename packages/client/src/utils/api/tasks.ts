import type { Task, TaskType } from "@emstack/types";

import { createEntityClient } from "./client";

export const tasksApi = createEntityClient<Task>("tasks", "task");
export const taskTypesApi = createEntityClient<TaskType>(
  "task-types",
  "task type",
);

export const fetchTasks = tasksApi.list;
export const fetchSingleTask = tasksApi.get;
export const upsertTask = tasksApi.upsert;
export const createTask = tasksApi.create;
export const deleteSingleTask = tasksApi.delete;

export const fetchTaskTypes = taskTypesApi.list;
export const upsertTaskType = taskTypesApi.upsert;
export const createTaskType = taskTypesApi.create;
export const deleteSingleTaskType = taskTypesApi.delete;
