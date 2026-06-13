// Slimmed-down projection of a Todoist task, returned by
// GET /api/todoist/tasks. The middleware maps the raw Todoist API task onto
// this shape so the client never sees the full payload.
export interface TodoistTask {
  id: string;
  content: string;
  // Deep link to the task in the Todoist web app.
  url: string;
  // Todoist's 1–4 priority scale (4 = most urgent, shown as "P1" in Todoist).
  priority: number;
  // Human-readable due string from Todoist (e.g. "13 Jun", "every day"), or null.
  due: string | null;
  // Calendar date portion (YYYY-MM-DD) of the due date, for display/sorting.
  dueDate: string | null;
  isRecurring: boolean;
  // Name of the task's Todoist project (resolved from project_id), or null.
  project: string | null;
  // Label names attached to the task (Todoist returns these as plain strings).
  labels: string[];
  // Task description/notes; empty string when none.
  description: string;
}

export interface TodoistTasks {
  // false when no Todoist token has been saved yet — lets the dashboard card
  // prompt the user to add one instead of surfacing an error.
  configured: boolean;
  // Tasks whose due date is before today, oldest first.
  overdue: TodoistTask[];
  // Tasks due today.
  today: TodoistTask[];
}
