import type {
  Daily,
  DailyCompletion,
  DailyCriteria,
} from "@emstack/types";

// The fields mapDaily reads. Both the single-daily and list daily queries
// produce a superset of this shape, so their Drizzle rows are assignable here.
interface DailyProjectionRow {
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
  resource: {
    id: string;
    name: string;
    progressCurrent: number | null;
    progressTotal: number | null;
  } | null;
  task: {
    id: string;
    name: string;
    todos?: { id: string;
      isComplete: boolean; }[];
    resources?: { id: string;
      usedYet: boolean; }[];
  } | null;
}

export function mapDaily(daily: DailyProjectionRow): Daily {
  const taskRecord = daily.task;
  const taskBlock = taskRecord
    ? {
      id: taskRecord.id,
      name: taskRecord.name,
      progress: {
        todosTotal: taskRecord.todos?.length ?? 0,
        todosComplete:
          taskRecord.todos?.filter(t => t.isComplete).length ?? 0,
        resourcesTotal: taskRecord.resources?.length ?? 0,
        resourcesUsed:
          taskRecord.resources?.filter(r => r.usedYet).length ?? 0,
      },
    }
    : null;

  return {
    id: daily.id,
    name: daily.name,
    location: daily.location,
    description: daily.description,
    completions: (daily.completions ?? []) as DailyCompletion[],
    status: daily.status ?? "active",
    criteria: (daily.criteria ?? {}) as DailyCriteria,
    taskId: daily.taskId ?? null,
    task: taskBlock,
    provider:
      daily.courseProvider?.name && daily.courseProvider?.id
        ? {
          name: daily.courseProvider.name,
          id: daily.courseProvider.id,
        }
        : undefined,
    resource:
      daily.resource?.id && daily.resource?.name
        ? {
          id: daily.resource.id,
          name: daily.resource.name,
          progressCurrent: daily.resource.progressCurrent ?? 0,
          progressTotal: daily.resource.progressTotal ?? 0,
        }
        : undefined,
    moduleGroupId: daily.moduleGroupId ?? null,
    moduleId: daily.moduleId ?? null,
  };
}
