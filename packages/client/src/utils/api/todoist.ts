import type { TodoistTasks } from "@emstack/types";

import { fetchJson } from "./client";

export function fetchTodoistTasks(): Promise<TodoistTasks> {
  return fetchJson<TodoistTasks>("/api/todoist/tasks");
}
