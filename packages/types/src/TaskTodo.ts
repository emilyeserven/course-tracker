import type { DailyCompletionStatus } from "./Daily";
import type { TaskBookmark } from "./TaskBookmark";

// A todo within a Task List. Modeled like a Curated Routine entry
// (RoutineReferenceItem): it carries a status (same 5-state set as routine
// tasks), an optional due date, and optional note/location. It may link to any
// number of Simple Bookmarks bookmarks; with no bookmarks it is a plain
// checklist item.
export interface TaskTodo {
  id: string;
  taskId: string;
  name: string;
  status: DailyCompletionStatus;
  // Optional per-todo due date ("YYYY-MM-DD"). Drives Do Now surfacing.
  dueDate?: string | null;
  note?: string | null;
  location?: string | null;
  url?: string | null;
  position?: number | null;
  // Associations to Simple Bookmarks bookmarks (the item→bookmark links that
  // replaced the removed local Resource link).
  bookmarks?: TaskBookmark[];
}

// A todo is "complete" when its status reached the goal threshold. Shared by
// client and middleware so the rollup is computed identically everywhere.
export function isTodoComplete(status: DailyCompletionStatus): boolean {
  return status === "goal" || status === "exceeded";
}
