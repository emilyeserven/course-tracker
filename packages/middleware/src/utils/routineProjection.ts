import type {
  Daily,
  DailyCompletion,
  DailyCriteria,
  EntityStatus,
  RoutineConnection,
  RoutineCurated,
  RoutineMode,
  RoutineReferenceItem,
  RoutineWeekly,
} from "@emstack/types";
import { buildActionableSentence } from "@emstack/types";
import type { DailyProjectionRow } from "./dailyProjection";
import { mapDaily } from "./dailyProjection";
import type {
  ResolvedConnections,
  ResolvedResource,
  ResolvedTask,
} from "./routineActionParts";
import { resolveActionParts } from "./routineActionParts";
import {
  currentDateKey,
  entryForCompletionDate,
  representativeEntry,
} from "./routineWeekday";

// Pure entry-resolution helpers live in the dependency-free routineWeekday leaf
// module (unit-tested there directly). Re-export only the ones the projection's
// callers consume from here, so they keep a single import site; the rest are
// imported from routineWeekday directly.
export { currentDateKey, entryForCompletionDate, representativeEntry };
export type { ResolvedConnections, ResolvedResource, ResolvedTask };

// The routine columns (plus its resolved connections) the projection reads.
export interface RoutineRow {
  id: string;
  name: string;
  description: string | null;
  status: EntityStatus | null;
  weekly: RoutineWeekly | null;
  curated: RoutineCurated | null;
  mode: RoutineMode;
  completions: DailyCompletion[];
  criteria: DailyCriteria;
  weeklyTarget: number | null;
  connections?: RoutineConnection[];
}

// A routine projected into the Daily shape (so the existing daily tracker /
// detail components render unchanged) while still carrying the routine-specific
// fields (mode, weekly, curated, connections) consumers need.
export type RoutineDaily = Daily & {
  mode: RoutineMode;
  weekly: RoutineWeekly;
  curated: RoutineCurated;
  weeklyTarget: number | null;
  connections: RoutineConnection[];
};

// Assemble the DailyProjectionRow mapDaily expects from a routine, its active
// entry, and the resolved connections. Provider/module sub-targeting is
// intentionally dropped in the unified routine model (always null).
function toDailyRow(
  routine: RoutineRow,
  entry: RoutineReferenceItem | null,
  resolved: ResolvedConnections,
): DailyProjectionRow {
  return {
    id: routine.id,
    name: routine.name,
    location: entry?.location ?? null,
    description: routine.description,
    completions: routine.completions ?? [],
    status: routine.status,
    criteria: routine.criteria ?? {},
    taskId: resolved.task?.id ?? null,
    moduleGroupId: null,
    moduleId: null,
    courseProvider: null,
    resource: resolved.resource ?? null,
    task: resolved.task ?? null,
  };
}

// Build a Daily-compatible object from a routine, resolving today's active
// entry's task/resource into progress blocks via mapDaily.
export function mapRoutineToDaily(
  routine: RoutineRow,
  resolved: ResolvedConnections = {},
  dateKey: string = currentDateKey(),
): RoutineDaily {
  // The active entry carries the per-item location and the prepend/append text:
  // today's scheduled entry for weekly routines, today's date entry for curated
  // routines, or the representative entry (mirrored on every day) for daily
  // ones. Uses the same resolver as the caller's id-collection so the two never
  // pick different entries.
  const entry = entryForCompletionDate(
    routine.mode,
    routine.weekly,
    routine.curated,
    dateKey,
  );

  const daily = mapDaily(toDailyRow(routine, entry, resolved));

  // Surface the resolved name (task/resource/freeform) as the daily's action
  // title, wrapped with any affixes into a natural sentence. The flat label is
  // derived from the structured parts so the two never drift.
  const actionParts = resolveActionParts(entry, resolved);
  const actionLabel = actionParts ? buildActionableSentence(actionParts) : null;

  return {
    ...daily,
    actionLabel,
    actionParts,
    mode: routine.mode,
    weekly: routine.weekly ?? {},
    curated: routine.curated ?? {
      endDate: null,
      entries: {},
    },
    weeklyTarget: routine.weeklyTarget ?? null,
    connections: routine.connections ?? [],
  };
}
