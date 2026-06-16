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
    resourceId: t.resourceId ?? null,
    moduleGroupId: t.moduleGroupId ?? null,
    moduleId: t.moduleId ?? null,
  };
}
