import type { RoutineReferenceItem } from "./Routine.js";

import { resourceEntryLabel } from "./resourceEntryLabel.js";

// Display name for a routine reference item: freeform entries carry their own text
// in `id`; task / resource entries resolve through the id → name maps, falling back
// to the raw id on a miss. A resource entry narrowed to a module / module group
// shows that narrower name (see resourceEntryLabel). Shared by the client schedule
// rendering and the middleware completion baking so the two never drift.
export function routineEntryName(
  entry: RoutineReferenceItem,
  taskNames: Map<string, string>,
  resourceNames: Map<string, string>,
  moduleNames = new Map<string, string>(),
  moduleGroupNames = new Map<string, string>(),
): string {
  if (entry.type === "freeform") {
    return entry.id;
  }
  if (entry.type === "task") {
    return taskNames.get(entry.id) ?? entry.id;
  }
  return resourceEntryLabel({
    resourceName: resourceNames.get(entry.id) ?? entry.id,
    moduleName: entry.moduleId ? moduleNames.get(entry.moduleId) : null,
    groupName: entry.moduleGroupId
      ? moduleGroupNames.get(entry.moduleGroupId)
      : null,
  });
}
