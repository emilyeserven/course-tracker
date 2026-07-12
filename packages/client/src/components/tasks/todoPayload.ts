import type { TaskTodo } from "@emstack/types";

// Map a TaskTodo into the upsert payload shape the tasks API accepts. Shared by
// the Task List edit form (which preserves existing todos untouched) and the
// inline todo editor, so the two never drift on which fields round-trip.
export function toTodoInput(t: TaskTodo) {
  return {
    id: t.id,
    name: t.name,
    status: t.status,
    dueDate: t.dueDate ?? null,
    note: t.note ?? null,
    location: t.location ?? null,
    url: t.url ?? null,
    // Round-trip bookmarks: task_todos are rebuilt on every save, so omitting
    // these would drop a todo's bookmark associations on any edit.
    bookmarks: (t.bookmarks ?? []).map(b => ({
      id: b.id,
      bookmarkId: b.bookmarkId,
      title: b.title,
      url: b.url,
    })),
  };
}
