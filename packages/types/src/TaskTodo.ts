import type { DailyCompletionStatus } from "./Daily";
import type { ResourceLinkNarrowing } from "./ResourceLinkTarget";

// A todo within a Task List. Modeled like a Curated Routine entry
// (RoutineReferenceItem): it carries a status (same 5-state set as routine
// tasks), an optional due date, optional note/location, and an optional link to
// a single Resource (with optional moduleGroup/module narrowing). All three
// resource fields null = a plain checklist item.
export interface TaskTodo extends ResourceLinkNarrowing {
  id: string;
  taskId: string;
  name: string;
  status: DailyCompletionStatus;
  // Optional per-todo due date ("YYYY-MM-DD"). Drives Do Now surfacing and the
  // date a todo completion is logged under on a linked resource.
  dueDate?: string | null;
  note?: string | null;
  location?: string | null;
  url?: string | null;
  position?: number | null;
  // Optional link to a top-level Resource. Both moduleGroupId/moduleId null =
  // whole-resource link; all three null = plain checklist item.
  resourceId?: string | null;
}

// A todo is "complete" when its status reached the goal threshold. Shared by
// client and middleware so the rollup is computed identically everywhere.
export function isTodoComplete(status: DailyCompletionStatus): boolean {
  return status === "goal" || status === "exceeded";
}
