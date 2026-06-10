import type {
  Daily,
  DailyCompletion,
  DailyCriteria,
  EntityStatus,
  RoutineConnection,
  RoutineMode,
  RoutineReferenceItem,
  RoutineWeekly,
} from "@emstack/types";
import { buildActionableSentence } from "@emstack/types";
import { mapDaily } from "./dailyProjection";

const DAY_KEYS = ["0", "1", "2", "3", "4", "5", "6"] as const;

// In daily mode every weekday holds the same entry, so the first populated day
// is a faithful "representative" of the routine's single task/resource. Returns
// null for an empty grid or a freeform-only routine (where the name carries the
// label).
export function representativeEntry(
  weekly: RoutineWeekly | null | undefined,
): RoutineReferenceItem | null {
  if (!weekly) {
    return null;
  }
  for (const key of DAY_KEYS) {
    const entry = weekly[key];
    if (entry && entry.id) {
      return entry;
    }
  }
  return null;
}

// Resolved task/resource rows the handler loads for a representative entry. They
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
): RoutineDaily {
  // The representative entry carries the per-item location (daily mode mirrors
  // the same entry on every day) and the prepend/append text below.
  const entry = representativeEntry(routine.weekly);

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
