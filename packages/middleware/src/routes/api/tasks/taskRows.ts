import { v4 as uuidv4 } from "uuid";

import type { DailyCompletionStatus, TaskResourceLink } from "@emstack/types";

import {
  bookmarkLinksArraySchema,
  nullableString,
  resourceLinksArraySchema,
  resourceSchema,
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
  topicId?: string | null;
  taskTypeId?: string | null;
}

export type ResourceLinkInput = Pick<
  TaskResourceLink,
  "resourceId" | "moduleGroupId" | "moduleId"
>;

export interface BookmarkInput {
  id?: string | null;
  bookmarkId: string;
  title: string;
  url?: string | null;
}

export interface TaskResourceInput {
  id?: string | null;
  name: string;
  url?: string | null;
  usedYet?: boolean | null;
  resourceId?: string | null;
  moduleGroupId?: string | null;
  moduleId?: string | null;
}

export interface TodoInput {
  id?: string | null;
  name: string;
  status?: DailyCompletionStatus | null;
  dueDate?: string | null;
  note?: string | null;
  location?: string | null;
  url?: string | null;
  resourceId?: string | null;
  moduleGroupId?: string | null;
  moduleId?: string | null;
  bookmarks?: BookmarkInput[];
}

export interface TaskBody extends TaskBodyFields {
  tagIds?: string[];
  resourceLinks?: ResourceLinkInput[];
  bookmarks?: BookmarkInput[];
  resources?: TaskResourceInput[];
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
    topicId: nullableString,
    taskTypeId: nullableString,
    tagIds: tagIdsArraySchema,
    resourceLinks: resourceLinksArraySchema,
    bookmarks: bookmarkLinksArraySchema,
    resources: {
      type: "array",
      items: resourceSchema,
    },
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
    topicId: body.topicId || null,
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

export function buildResourceLinkRows(
  resourceLinks: readonly ResourceLinkInput[] | undefined,
  taskId: string,
  makeId: () => string = uuidv4,
) {
  if (resourceLinks === undefined) return undefined;
  // Dedupe by the full (resourceId, moduleGroupId, moduleId) tuple so a task
  // can hold multiple rows per resource (e.g. whole-resource + a specific
  // module) without duplicates.
  const seen = new Set<string>();
  const rows: {
    id: string;
    taskId: string;
    resourceId: string;
    moduleGroupId: string | null;
    moduleId: string | null;
    position: number;
  }[] = [];
  resourceLinks.forEach((link, index) => {
    const key = `${link.resourceId}|${link.moduleGroupId ?? ""}|${link.moduleId ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({
      id: makeId(),
      taskId,
      resourceId: link.resourceId,
      moduleGroupId: link.moduleGroupId ?? null,
      moduleId: link.moduleId ?? null,
      position: index,
    });
  });
  return rows;
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
      position: index,
    });
  });
  return rows;
}

export function buildTaskResourceRows(
  resources: readonly TaskResourceInput[] | undefined,
  taskId: string,
  makeId: () => string = uuidv4,
) {
  if (resources === undefined) return undefined;
  return resources.map((r, index) => ({
    id: r.id || makeId(),
    taskId,
    name: r.name,
    url: r.url ?? null,
    usedYet: r.usedYet ?? false,
    position: index,
    resourceId: r.resourceId ?? null,
    // A module-group / module narrowing only makes sense under a resource
    // link; drop it when no resourceId is set.
    moduleGroupId: r.resourceId ? r.moduleGroupId ?? null : null,
    moduleId: r.resourceId ? r.moduleId ?? null : null,
  }));
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
    resourceId: t.resourceId ?? null,
    // A module-group / module narrowing only makes sense under a resource link;
    // drop it when no resourceId is set.
    moduleGroupId: t.resourceId ? t.moduleGroupId ?? null : null,
    moduleId: t.resourceId ? t.moduleId ?? null : null,
  }));
}
