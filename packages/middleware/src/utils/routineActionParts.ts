import type { Daily, RoutineReferenceItem } from "@emstack/types";
import { resourceEntryLabel } from "@emstack/types";

// Resolved task/resource rows the handler loads for an active entry. These are
// the resource/task blocks mapDaily reads — DailyProjectionRow references them
// directly (see dailyProjection.ts) so the two can't drift.
export interface ResolvedTask {
  id: string;
  name: string;
  todos?: { id: string;
    isComplete: boolean; }[];
  resources?: { id: string;
    usedYet: boolean; }[];
}

export interface ResolvedResource {
  id: string;
  name: string;
  progressCurrent: number | null;
  progressTotal: number | null;
  // When false, the resource opts out of progress tracking (shows an infinity
  // icon in the tracker). Optional so callers that don't select it default to
  // tracked via mapDaily's `?? true`.
  tracksProgress?: boolean | null;
}

// A resolved module / module-group name for a resource entry that narrows to one.
export interface ResolvedNamed {
  id: string;
  name: string;
}

// The task/resource rows a handler has already resolved for the active entry,
// plus any module/group a resource entry narrows to (used for the display name).
export interface ResolvedConnections {
  task?: ResolvedTask | null;
  resource?: ResolvedResource | null;
  module?: ResolvedNamed | null;
  moduleGroup?: ResolvedNamed | null;
}

// The name the action sentence wraps: a resolved resource (narrowed to its
// module / group name when the entry targets one), then a resolved task, then a
// freeform entry's own id (which holds the freeform text). Null when nothing
// resolves, so the projection falls back to the routine title.
function resolveBaseName(
  entry: RoutineReferenceItem | null,
  resolved: ResolvedConnections,
): string | null {
  if (resolved.resource) {
    return resourceEntryLabel({
      resourceName: resolved.resource.name,
      moduleName: resolved.module?.name,
      groupName: resolved.moduleGroup?.name,
    });
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
