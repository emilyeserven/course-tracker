import type { DailyCompletionStatus } from "./Daily";

// A Task List todo whose linked resource is `resourceId`, surfaced on that
// resource's Interactions tab alongside RoutineInteraction and manual
// interactions. Derived server-side; a projection, not a stored entity.
export interface TodoInteraction {
  // Stable React key: the todo's id (a todo links at most one resource).
  id: string;
  taskId: string;
  taskName: string;
  todoId: string;
  todoName: string;
  // The date the completion is logged under: the todo's due date, or today
  // when it has none. ISO "YYYY-MM-DD".
  date: string;
  status: DailyCompletionStatus;
  note?: string | null;
  // Always "resource" today (a todo touches a resource by linking it directly);
  // kept parallel to RoutineInteraction.via for a unified row renderer.
  via: "resource";
}
