import type { DailyCompletionStatus } from "./Daily";

// A routine completion (a logged day-entry that carries a status) whose scheduled
// action touched a particular resource — either because that day's action *is*
// the resource, or because it's a task linked to the resource. Derived
// server-side for a resource's Interactions tab; this is a projection, not a
// stored entity.
export interface RoutineInteraction {
  // Synthetic but stable: `${routineId}:${date}` (a routine has at most one
  // completion per date). Used as the React key when merged into the log.
  id: string;
  routineId: string;
  routineName: string;
  date: string; // ISO yyyy-mm-dd, matching the completion's date key
  status: DailyCompletionStatus;
  note?: string | null;
  // The frozen/resolved action sentence (e.g. "Review Spanish flashcards for 10
  // minutes"). Null when the completion has no baked snapshot (legacy entries);
  // consumers fall back to the routine name.
  actionLabel?: string | null;
  // How the completion touched the resource: the day's action was the resource
  // itself ("resource") or a task linked to it ("task").
  via: "resource" | "task";
}
