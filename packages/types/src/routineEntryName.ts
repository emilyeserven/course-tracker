import type { RoutineReferenceItem } from "./Routine.js";

// Display name for a routine reference item: freeform entries carry their own
// text in `id`; bookmark entries carry a cached title on the entry; task entries
// resolve through the id → name map, falling back to the raw id on a miss. Shared
// by the client schedule rendering and the middleware completion baking so the
// two never drift.
export function routineEntryName(
  entry: RoutineReferenceItem,
  taskNames: Map<string, string>,
): string {
  if (entry.type === "freeform") {
    return entry.id;
  }
  if (entry.type === "bookmark") {
    // External bookmark: no id→name map; the cached title lives on the entry.
    return entry.title ?? entry.id;
  }
  return taskNames.get(entry.id) ?? entry.id;
}
