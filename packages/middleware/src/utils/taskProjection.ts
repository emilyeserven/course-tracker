import type {
  DailyCompletionStatus,
  ResourceLinkTarget,
  Tag,
  Task,
  TaskBookmark,
  TaskResourceLevel,
} from "@emstack/types";

// A Resource / ModuleGroup / Module target as selected by the task queries.
interface LinkTargetRow {
  id: string;
  name: string;
  easeOfStarting: TaskResourceLevel | null;
  timeNeeded: TaskResourceLevel | null;
  interactivity: TaskResourceLevel | null;
}

interface TaskResourceJoinRow {
  id: string;
  resourceId: string;
  moduleGroupId: string | null;
  moduleId: string | null;
  position: number | null;
  resource: LinkTargetRow | null;
  moduleGroup: LinkTargetRow | null;
  module: LinkTargetRow | null;
}

interface TaskBookmarkRow {
  id: string;
  bookmarkId: string;
  title: string;
  url: string | null;
  sectionId: string | null;
  sectionLabel: string | null;
  position: number | null;
}

function mapBookmark(b: TaskBookmarkRow): TaskBookmark {
  return {
    id: b.id,
    bookmarkId: b.bookmarkId,
    title: b.title,
    url: b.url ?? null,
    sectionId: b.sectionId ?? null,
    sectionLabel: b.sectionLabel ?? null,
    position: b.position ?? null,
  };
}

interface TaskResourceRow {
  id: string;
  taskId: string;
  name: string;
  url: string | null;
  usedYet: boolean;
  position: number | null;
  resourceId: string | null;
  moduleGroupId: string | null;
  moduleId: string | null;
  resource: LinkTargetRow | null;
  moduleGroup: LinkTargetRow | null;
  module: LinkTargetRow | null;
}

interface TaskTodoRow {
  id: string;
  taskId: string;
  name: string;
  status: DailyCompletionStatus;
  dueDate: string | null;
  note: string | null;
  location: string | null;
  url: string | null;
  position: number | null;
  resourceId: string | null;
  moduleGroupId: string | null;
  moduleId: string | null;
  resource: LinkTargetRow | null;
  moduleGroup: LinkTargetRow | null;
  module: LinkTargetRow | null;
  bookmarks: TaskBookmarkRow[];
}

// The fields mapTask reads. The single-task and list task queries produce a
// superset of this shape, so their Drizzle rows are assignable here.
interface TaskProjectionRow {
  id: string;
  name: string;
  description: string | null;
  topicId: string | null;
  taskTypeId: string | null;
  topic: { id: string;
    name: string; } | null;
  taskType: { id: string;
    name: string;
    tags: string[] | null; } | null;
  tasksToTags: { tag: Tag }[];
  tasksToResources: TaskResourceJoinRow[];
  bookmarks: TaskBookmarkRow[];
  resources: TaskResourceRow[];
  todos: TaskTodoRow[];
}

function mapLinkTarget(t: LinkTargetRow | null): ResourceLinkTarget | null {
  return t
    ? {
      id: t.id,
      name: t.name,
      easeOfStarting: t.easeOfStarting ?? null,
      timeNeeded: t.timeNeeded ?? null,
      interactivity: t.interactivity ?? null,
    }
    : null;
}

const byPosition = (a: { position: number | null }, b: { position: number | null }) =>
  (a.position ?? 0) - (b.position ?? 0);

export function mapTask(task: TaskProjectionRow): Task {
  return {
    id: task.id,
    name: task.name,
    description: task.description,
    topicId: task.topicId ?? null,
    topic: task.topic
      ? {
        id: task.topic.id,
        name: task.topic.name,
      }
      : null,
    taskTypeId: task.taskTypeId ?? null,
    taskType: task.taskType
      ? {
        id: task.taskType.id,
        name: task.taskType.name,
        tags: task.taskType.tags ?? [],
      }
      : null,
    tags: (task.tasksToTags ?? []).map(j => j.tag),
    resourceLinks: (task.tasksToResources ?? []).map(j => ({
      id: j.id,
      resourceId: j.resourceId,
      resource: mapLinkTarget(j.resource),
      moduleGroupId: j.moduleGroupId ?? null,
      moduleGroup: mapLinkTarget(j.moduleGroup),
      moduleId: j.moduleId ?? null,
      module: mapLinkTarget(j.module),
      position: j.position ?? null,
    })),
    bookmarks: (task.bookmarks ?? [])
      .slice()
      .sort(byPosition)
      .map(mapBookmark),
    resources: (task.resources ?? [])
      .slice()
      .sort(byPosition)
      .map(r => ({
        id: r.id,
        taskId: r.taskId,
        name: r.name,
        url: r.url,
        usedYet: r.usedYet,
        position: r.position,
        resourceId: r.resourceId ?? null,
        resource: mapLinkTarget(r.resource),
        moduleGroupId: r.moduleGroupId ?? null,
        moduleGroup: mapLinkTarget(r.moduleGroup),
        moduleId: r.moduleId ?? null,
        module: mapLinkTarget(r.module),
      })),
    todos: (task.todos ?? [])
      .slice()
      .sort(byPosition)
      .map(t => ({
        id: t.id,
        taskId: t.taskId,
        name: t.name,
        status: t.status,
        dueDate: t.dueDate ?? null,
        note: t.note ?? null,
        location: t.location ?? null,
        url: t.url ?? null,
        position: t.position,
        resourceId: t.resourceId ?? null,
        resource: mapLinkTarget(t.resource),
        moduleGroupId: t.moduleGroupId ?? null,
        moduleGroup: mapLinkTarget(t.moduleGroup),
        moduleId: t.moduleId ?? null,
        module: mapLinkTarget(t.module),
        bookmarks: (t.bookmarks ?? [])
          .slice()
          .sort(byPosition)
          .map(mapBookmark),
      })),
  };
}
