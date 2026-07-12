import type { DailyCompletionStatus, Daily, RoutineReferenceItem } from "@emstack/types";

// Resolved task rows the handler loads for an active entry. This is the task
// block mapDaily reads — DailyProjectionRow references it directly (see
// dailyProjection.ts) so the two can't drift.
export interface ResolvedTask {
  id: string;
  name: string;
  todos?: { id: string;
    status: DailyCompletionStatus; }[];
}

// The task row a handler has already resolved for the active entry.
export interface ResolvedConnections {
  task?: ResolvedTask | null;
}

// The name the action sentence wraps: a resolved task, then a freeform entry's
// own id (which holds the freeform text). Null when nothing resolves, so the
// projection falls back to the routine title.
function resolveBaseName(
  entry: RoutineReferenceItem | null,
  resolved: ResolvedConnections,
): string | null {
  // External bookmark: the cached title is on the entry (nothing to resolve).
  if (entry?.type === "bookmark") {
    return entry.title ?? entry.id;
  }
  return (
    resolved.task?.name ?? (entry?.type === "freeform" ? entry.id : null)
  );
}

// Derive the structured action parts (optional prepend/append affixes wrapping
// the resolved name) for a routine's active entry. The flat actionLabel is
// built from these by the caller, so the two never drift. Returns null when
// there's no active entry or nothing resolves to a name.
export function resolveActionParts(
  entry: RoutineReferenceItem | null,
  resolved: ResolvedConnections,
): Daily["actionParts"] {
  const baseName = resolveBaseName(entry, resolved);
  if (!entry || !baseName) {
    return null;
  }
  return {
    prependText: entry.prependText ?? null,
    name: baseName,
    appendText: entry.appendText ?? null,
  };
}
