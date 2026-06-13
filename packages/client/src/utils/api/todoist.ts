import type { TodoistTasks } from "@emstack/types";

import { fetchJson, postJson } from "./client";

export function fetchTodoistTasks(): Promise<TodoistTasks> {
  return fetchJson<TodoistTasks>("/api/todoist/tasks");
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
