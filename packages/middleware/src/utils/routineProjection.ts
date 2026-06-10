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
  location: string | null;
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
  const daily = mapDaily({
    id: routine.id,
    name: routine.name,
    location: routine.location,
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

  // Wrap the representative entry's name with its prepend/append text into a
  // natural sentence. Only set when the user actually added prepend/append text,
  // so untouched dailies keep falling back to the routine name.
  const entry = representativeEntry(routine.weekly);
  const baseName
    = resolved.resource?.name
      ?? resolved.task?.name
      ?? (entry?.type === "freeform" ? entry.id : null);
  const actionLabel
    = entry && baseName && (entry.prependText || entry.appendText)
      ? buildActionableSentence({
        prependText: entry.prependText,
        name: baseName,
        appendText: entry.appendText,
      })
      : null;

  return {
    ...daily,
    actionLabel,
    mode: routine.mode,
    weekly: routine.weekly ?? {},
    connections: routine.connections ?? [],
  };
}
