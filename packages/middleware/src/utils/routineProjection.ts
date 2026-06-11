import type {
  Daily,
  DailyCompletion,
  DailyCriteria,
  EntityStatus,
  RoutineConnection,
  RoutineMode,
  RoutineWeekday,
  RoutineWeekly,
} from "@emstack/types";
import { buildActionableSentence } from "@emstack/types";
import { mapDaily } from "./dailyProjection";
import {
  activeEntry,
  currentWeekday,
  representativeEntry,
} from "./routineWeekday";

// Entry-selection helpers live in a dependency-free leaf module so they can be
// unit-tested directly; re-export them here so callers keep a single import site.
export { activeEntry, currentWeekday, representativeEntry };

// Resolved task/resource rows the handler loads for an active entry. They
// mirror the column selection mapDaily expects (see dailyProjection.ts).
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
}

// The routine columns (plus its resolved connections) the projection reads.
export interface RoutineRow {
  id: string;
  name: string;
  description: string | null;
  status: EntityStatus | null;
  weekly: RoutineWeekly | null;
  mode: RoutineMode;
  completions: DailyCompletion[];
  criteria: DailyCriteria;
  connections?: RoutineConnection[];
}

// A daily-mode routine projected into the Daily shape (so the existing daily
// tracker / detail components render unchanged) while still carrying the
// routine-specific fields (mode, weekly, connections) consumers need.
export type RoutineDaily = Daily & {
  mode: RoutineMode;
  weekly: RoutineWeekly;
  connections: RoutineConnection[];
};

// Build a Daily-compatible object from a daily-mode routine, resolving the
// representative weekly entry's task/resource into progress blocks via mapDaily.
// Provider/module sub-targeting is intentionally dropped in the unified model.
export function mapRoutineToDaily(
  routine: RoutineRow,
  resolved: { task?: ResolvedTask | null;
    resource?: ResolvedResource | null; } = {},
  weekday: RoutineWeekday = currentWeekday(),
): RoutineDaily {
  // The active entry carries the per-item location and the prepend/append text
  // below: today's scheduled entry for weekly routines, or the representative
  // entry (mirrored on every day) for daily ones.
  const entry = activeEntry(routine.weekly, routine.mode, weekday);

  const daily = mapDaily({
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
  });

  // Surface the representative entry's resolved name (task/resource/freeform) as
  // the daily's action title, wrapped with any prepend/append text into a
  // natural sentence. Set whenever the entry resolves to a name — affixes are
  // optional and may be null — so a daily assigned to something shows that
  // thing's name even without affixes, with the routine name rendered beneath.
  // A daily with no representative entry still falls back to the routine name.
  const baseName
    = resolved.resource?.name
      ?? resolved.task?.name
      ?? (entry?.type === "freeform" ? entry.id : null);
  // Structured parts (affixes + name) so consumers can render the name heavier
  // than the surrounding text; the flat label is derived from them so the two
  // never drift.
  const actionParts
    = entry && baseName
      ? {
        prependText: entry.prependText ?? null,
        name: baseName,
        appendText: entry.appendText ?? null,
      }
      : null;
  const actionLabel = actionParts ? buildActionableSentence(actionParts) : null;

  return {
    ...daily,
    actionLabel,
    actionParts,
    mode: routine.mode,
    weekly: routine.weekly ?? {},
    connections: routine.connections ?? [],
  };
}
