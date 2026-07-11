import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { todoBookmarks } from "@/db/schema";

import { buildTodoBookmarkRows } from "./taskRows";

import type { TodoInput } from "./taskRows";

// Re-sync todo_bookmarks after task_todos have been (re)written by the task
// handlers. task_todos are rebuilt on every task save (delete + reinsert), which
// cascade-clears their todo_bookmarks, so we rebuild them from the todo payload
// here (run from afterCreate / afterUpsert). No-op when the request omitted
// `todos` entirely (a field-only task update leaves todos and their bookmarks
// untouched). Todos are keyed by their client-supplied id.
export async function syncTodoBookmarks(
  todos: readonly TodoInput[] | undefined,
): Promise<void> {
  if (todos === undefined) return;

  const todoIds = todos
    .map(t => t.id)
    .filter((id): id is string => !!id);
  if (todoIds.length > 0) {
    await db.delete(todoBookmarks).where(inArray(todoBookmarks.todoId, todoIds));
  }

  const rows = todos.flatMap(t =>
    t.id ? buildTodoBookmarkRows(t.bookmarks, t.id) ?? [] : []);
  if (rows.length > 0) {
    await db.insert(todoBookmarks).values(rows);
  }
}
