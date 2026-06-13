import type { SuccessObj } from "./client";
import type { TodoistTasks } from "@emstack/types";

import { fetchJson, postJson } from "./client";

export function fetchTodoistTasks(): Promise<TodoistTasks> {
  return fetchJson<TodoistTasks>("/api/todoist/tasks");
}

/** Mark a Todoist task complete (closes it in Todoist). */
export function closeTodoistTask(id: string): Promise<SuccessObj> {
  return postJson<SuccessObj>(
    `/api/todoist/tasks/${id}/close`,
    undefined,
    "Failed to complete task",
  );
}

export function createTodoistTask(input: {
  content: string;
  description?: string;
}): Promise<{ status: string;
  id: string; }> {
  return postJson(
    "/api/todoist/tasks",
    input,
    "Failed to add Todoist task",
  );
}
