// Pure Todoist URL builders. No `@/` imports, so node --test can load this
// directly (mirrors googleCalendarIcs.ts).

// Base for the close-task action (marks a task complete).
const TODOIST_TASKS_URL = "https://api.todoist.com/api/v1/tasks";

/**
 * Build the close-task action URL. The id is url-encoded so a value containing
 * `/`, `..`, or query chars can't manipulate the request path (CWE-918).
 */
export function buildCloseTaskUrl(id: string): string {
  return `${TODOIST_TASKS_URL}/${encodeURIComponent(id)}/close`;
}
