import { v4 as uuidv4 } from "uuid";

import type { DailyCompletionStatus } from "@emstack/types";

import {
  bookmarkLinksArraySchema,
  nullableString,
  tagIdsArraySchema,
  todoSchema,
} from "../../../utils/schemas.ts";

// Body schema and pure row builders shared by the task create and upsert
// handlers. Each junction builder returns `undefined` when its input is
// absent — callers (createUpsertHandler junctions) treat that as "leave
// existing rows untouched", while `[]` means "clear all rows".

export interface TaskBodyFields {
  name: string;
  description?: string | null;
  dueDate?: string | null;
  taskTypeId?: string | null;
}

export interface BookmarkInput {
  id?: string | null;
  bookmarkId: string;
  title: string;
  url?: string | null;
  sectionId?: string | null;
  sectionLabel?: string | null;
}

export interface TodoInput {
  id?: string | null;
  name: string;
  status?: DailyCompletionStatus | null;
  dueDate?: string | null;
  note?: string | null;
  location?: string | null;
  url?: string | null;
  bookmarks?: BookmarkInput[];
}

export interface TaskBody extends TaskBodyFields {
  tagIds?: string[];
  bookmarks?: BookmarkInput[];
  todos?: TodoInput[];
}

export const taskBodySchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: {
      type: "string",
    },
    description: nullableString,
    taskTypeId: nullableString,
    tagIds: tagIdsArraySchema,
    bookmarks: bookmarkLinksArraySchema,
    todos: {
      type: "array",
      items: todoSchema,
    },
  },
} as const;

export function buildTaskRow(body: TaskBodyFields, id: string) {
  return {
    id,
    name: body.name,
    description: body.description ?? null,
    dueDate: body.dueDate || null,
    taskTypeId: body.taskTypeId || null,
  };
}

export function buildTagRows(
  tagIds: readonly string[] | undefined,
  taskId: string,
) {
  if (tagIds === undefined) return undefined;
  return Array.from(new Set(tagIds)).map((tagId, index) => ({
    taskId,
    tagId,
    position: index,
  }));
}

export function buildBookmarkRows(
  bookmarks: readonly BookmarkInput[] | undefined,
  taskId: string,
  makeId: () => string = uuidv4,
) {
  if (bookmarks === undefined) return undefined;
  // Dedupe by bookmarkId so a task holds at most one row per bookmark.
  const seen = new Set<string>();
  const rows: {
    id: string;
    taskId: string;
    bookmarkId: string;
    title: string;
    url: string | null;
    sectionId: string | null;
    sectionLabel: string | null;
    position: number;
  }[] = [];
  bookmarks.forEach((b, index) => {
    if (seen.has(b.bookmarkId)) return;
    seen.add(b.bookmarkId);
    rows.push({
      id: b.id || makeId(),
      taskId,
      bookmarkId: b.bookmarkId,
      title: b.title,
      url: b.url ?? null,
      sectionId: b.sectionId ?? null,
      sectionLabel: b.sectionLabel ?? null,
      position: index,
    });
  });
  return rows;
}

export function buildTodoBookmarkRows(
  bookmarks: readonly BookmarkInput[] | undefined,
  todoId: string,
  makeId: () => string = uuidv4,
) {
  if (bookmarks === undefined) return undefined;
  const seen = new Set<string>();
  const rows: {
    id: string;
    todoId: string;
    bookmarkId: string;
    title: string;
    url: string | null;
    sectionId: string | null;
    sectionLabel: string | null;
    position: number;
  }[] = [];
  bookmarks.forEach((b, index) => {
    if (seen.has(b.bookmarkId)) return;
    seen.add(b.bookmarkId);
    rows.push({
      id: b.id || makeId(),
      todoId,
      bookmarkId: b.bookmarkId,
      title: b.title,
      url: b.url ?? null,
      sectionId: b.sectionId ?? null,
      sectionLabel: b.sectionLabel ?? null,
      position: index,
    });
  });
  return rows;
}

export function buildTodoRows(
  todos: readonly TodoInput[] | undefined,
  taskId: string,
  makeId: () => string = uuidv4,
) {
  if (todos === undefined) return undefined;
  return todos.map((t, index) => ({
    id: t.id || makeId(),
    taskId,
    name: t.name,
    status: t.status ?? "incomplete",
    dueDate: t.dueDate || null,
    note: t.note ?? null,
    location: t.location ?? null,
    url: t.url ?? null,
    position: index,
  }));
}
