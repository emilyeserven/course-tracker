import type {
  DailyCompletionStatus,
  Tag,
  Task,
  TaskBookmark,
} from "@emstack/types";

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
  bookmarks: TaskBookmarkRow[];
}

// The fields mapTask reads. The single-task and list task queries produce a
// superset of this shape, so their Drizzle rows are assignable here.
interface TaskProjectionRow {
  id: string;
  name: string;
  description: string | null;
  taskTypeId: string | null;
  taskType: { id: string;
    name: string;
    tags: string[] | null; } | null;
  tasksToTags: { tag: Tag }[];
  bookmarks: TaskBookmarkRow[];
  todos: TaskTodoRow[];
}

const byPosition = (a: { position: number | null }, b: { position: number | null }) =>
  (a.position ?? 0) - (b.position ?? 0);

export function mapTask(task: TaskProjectionRow): Task {
  return {
    id: task.id,
    name: task.name,
    description: task.description,
    taskTypeId: task.taskTypeId ?? null,
    taskType: task.taskType
      ? {
        id: task.taskType.id,
        name: task.taskType.name,
        tags: task.taskType.tags ?? [],
      }
      : null,
    tags: (task.tasksToTags ?? []).map(j => j.tag),
    bookmarks: (task.bookmarks ?? [])
      .slice()
      .sort(byPosition)
      .map(mapBookmark),
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
        bookmarks: (t.bookmarks ?? [])
          .slice()
          .sort(byPosition)
          .map(mapBookmark),
      })),
  };
}
