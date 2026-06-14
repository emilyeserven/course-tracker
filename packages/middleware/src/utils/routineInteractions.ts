import { buildActionableSentence } from "@emstack/types";

import { entryForCompletionDate } from "./routineWeekday.ts";

import type {
  DailyCompletion,
  DailyCompletionEntryRef,
  RoutineCurated,
  RoutineInteraction,
  RoutineMode,
  RoutineWeekly,
} from "@emstack/types";

// The routine columns the resource-interaction projection reads.
export interface RoutineForInteractions {
  id: string;
  name: string;
  mode: RoutineMode;
  weekly: RoutineWeekly | null;
  curated: RoutineCurated | null;
  completions: DailyCompletion[];
}

// Pure projection: the routine's completions whose scheduled day-action touched
// `resourceId` — directly (the action *is* the resource) or via a task in
// `taskIds` (tasks linked to the resource). Each completion's frozen entryRef is
// preferred; unbaked entries (e.g. daily-mode) fall back to live schedule
// resolution. Any completion with a status counts. Returned unsorted.
export function routineInteractionsForResource(
  routine: RoutineForInteractions,
  resourceId: string,
  taskIds: ReadonlySet<string>,
): RoutineInteraction[] {
  const out: RoutineInteraction[] = [];
  for (const c of routine.completions ?? []) {
    if (!c.status) {
      continue;
    }
    const ref: DailyCompletionEntryRef | null
      = c.entryRef !== undefined
        ? c.entryRef
        : entryForCompletionDate(
          routine.mode,
          routine.weekly,
          routine.curated,
          c.date,
        );
    if (!ref) {
      continue;
    }

    let via: RoutineInteraction["via"] | null = null;
    if (ref.type === "resource" && ref.id === resourceId) {
      via = "resource";
    }
    else if (ref.type === "task" && taskIds.has(ref.id)) {
      via = "task";
    }
    if (!via) {
      continue;
    }

    out.push({
      id: `${routine.id}:${c.date}`,
      routineId: routine.id,
      routineName: routine.name,
      date: c.date,
      status: c.status,
      note: c.note ?? null,
      actionLabel: c.entryParts
        ? buildActionableSentence(c.entryParts)
        : null,
      via,
    });
  }
  return out;
}
