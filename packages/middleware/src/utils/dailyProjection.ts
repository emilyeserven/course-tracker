import type {
  Daily,
  DailyCompletion,
  DailyCriteria,
} from "@emstack/types";
import { toProviderBlock } from "./providerProjection.ts";
import type { ResolvedResource, ResolvedTask } from "./routineActionParts.ts";

// The fields mapDaily reads. Both the single-daily and list daily queries
// produce a superset of this shape, so their Drizzle rows are assignable here.
export interface DailyProjectionRow {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  completions: DailyCompletion[];
  status: Daily["status"];
  criteria: DailyCriteria;
  taskId: string | null;
  moduleGroupId: string | null;
  moduleId: string | null;
  courseProvider: { id: string;
    name: string | null; } | null;
  resource: ResolvedResource | null;
  task: ResolvedTask | null;
}

// Collapse the joined task row into the Daily's task progress block. Returns
// null when no task is linked; the counts default to 0 for empty/absent arrays.
function toTaskBlock(task: DailyProjectionRow["task"]): Daily["task"] {
  if (!task) {
    return null;
  }
  return {
    id: task.id,
    name: task.name,
    progress: {
      todosTotal: task.todos?.length ?? 0,
      todosComplete: task.todos?.filter(t => t.isComplete).length ?? 0,
      resourcesTotal: task.resources?.length ?? 0,
      resourcesUsed: task.resources?.filter(r => r.usedYet).length ?? 0,
    },
  };
}

// Collapse the joined resource row into the Daily's resource block, present
// only when the join resolved to a real resource (both id and name).
function toResourceBlock(
  resource: DailyProjectionRow["resource"],
): Daily["resource"] {
  return resource?.id && resource?.name
    ? {
      id: resource.id,
      name: resource.name,
      progressCurrent: resource.progressCurrent ?? 0,
      progressTotal: resource.progressTotal ?? 0,
    }
    : undefined;
}

export function mapDaily(daily: DailyProjectionRow): Daily {
  return {
    id: daily.id,
    name: daily.name,
    location: daily.location,
    description: daily.description,
    completions: (daily.completions ?? []) as DailyCompletion[],
    status: daily.status ?? "active",
    criteria: (daily.criteria ?? {}) as DailyCriteria,
    taskId: daily.taskId ?? null,
    task: toTaskBlock(daily.task),
    provider: toProviderBlock(daily.courseProvider),
    resource: toResourceBlock(daily.resource),
    moduleGroupId: daily.moduleGroupId ?? null,
    moduleId: daily.moduleId ?? null,
  };
}
