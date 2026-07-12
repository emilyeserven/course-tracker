import { sql } from "drizzle-orm";
import { date, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { dailyCompletionStatusEnum } from "./enums";

// TODO(tag-reform-followup): drop this table once the Tag Groups + Tags system
// (tagGroups, tags, tasksToTags) has fully replaced the Task Type concept on
// tasks. Keep in place during the additive migration.
export const taskTypes = pgTable("task_types", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull(),
  whenToUse: varchar("when_to_use"),
  tags: varchar().array().notNull().default(sql`'{}'::varchar[]`),
});

export const tasks = pgTable("tasks", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  // Optional due date for the whole Task List, paralleling a Curated Routine's
  // end date.
  dueDate: date("due_date"),
  // TODO(tag-reform-followup): drop taskTypeId once the new Tag Groups + Tags
  // system fully replaces Task Types on tasks.
  taskTypeId: varchar("task_type_id"),
});

// A todo within a Task List, shaped like a Curated Routine entry: it carries a
// status (same 5-state set as routine tasks), an optional due date, optional
// note/location, and any number of Simple Bookmarks bookmark links (via
// todo_bookmarks). No bookmarks = a plain checklist item.
export const taskTodos = pgTable("task_todos", {
  id: varchar().primaryKey(),
  taskId: varchar("task_id").notNull(),
  name: varchar({
    length: 500,
  }).notNull(),
  status: dailyCompletionStatusEnum("status").default("incomplete").notNull(),
  dueDate: date("due_date"),
  note: varchar(),
  location: varchar(),
  url: varchar(),
  position: integer(),
});

// Junction associating a task with a Simple Bookmarks bookmark. `bookmarkId` is
// the bookmark's id in the companion app — there is deliberately NO foreign key
// because bookmarks live in a separate database. `title` / `url` are a
// denormalized cache of the bookmark at association time so a task's bookmark
// chips still render when Simple Bookmarks is unreachable. A task can hold
// multiple rows (multiple bookmarks); handlers dedupe by bookmarkId at write
// time. These bookmark links replaced the removed local Resource associations.
export const taskBookmarks = pgTable("task_bookmarks", {
  id: varchar().primaryKey(),
  taskId: varchar("task_id")
    .notNull()
    .references(() => tasks.id),
  bookmarkId: varchar("bookmark_id").notNull(),
  title: varchar({
    length: 500,
  }).notNull(),
  url: varchar(),
  // Optional narrowing to a section of the bookmark (null = whole bookmark).
  // `section_id` is the external SectionEntry id; `section_label` is the cached
  // label so the chip renders without refetching.
  sectionId: varchar("section_id"),
  sectionLabel: varchar("section_label"),
  position: integer(),
});

// Same as task_bookmarks, but associates a single todo with bookmarks. Cascades
// with its todo: task_todos rows are rebuilt (delete + reinsert) on every task
// save, so these rows are re-synced from the todo payload in the task handlers'
// afterCreate/afterUpsert step (see syncTodoBookmarks). `bookmarkId` is the
// external Simple Bookmarks id (no FK); `title` / `url` are the cached label.
export const todoBookmarks = pgTable("todo_bookmarks", {
  id: varchar().primaryKey(),
  todoId: varchar("todo_id")
    .notNull()
    .references(() => taskTodos.id, {
      onDelete: "cascade",
    }),
  bookmarkId: varchar("bookmark_id").notNull(),
  title: varchar({
    length: 500,
  }).notNull(),
  url: varchar(),
  // Optional narrowing to a section of the bookmark (null = whole bookmark).
  sectionId: varchar("section_id"),
  sectionLabel: varchar("section_label"),
  position: integer(),
});
