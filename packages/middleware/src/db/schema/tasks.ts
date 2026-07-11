import { sql } from "drizzle-orm";
import { boolean, date, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { moduleGroups, modules, resources } from "./courses";
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
  topicId: varchar("topic_id"),
  // TODO(tag-reform-followup): drop taskTypeId once the new Tag Groups + Tags
  // system fully replaces Task Types on tasks.
  taskTypeId: varchar("task_type_id"),
});

// DEPRECATED. Task-local resource entries now live on individual todos
// (task_todos.resource_id + narrowing). Kept only so migrateTodosRicherShape can
// read existing rows; once that migration has shipped to prod, drop this table
// and tasks_to_courses together.
// TODO(taskresource-followup): drop after migrateTodosRicherShape ships to prod.
export const taskResources = pgTable("task_resources", {
  id: varchar().primaryKey(),
  taskId: varchar("task_id").notNull(),
  name: varchar({
    length: 255,
  }).notNull(),
  url: varchar(),
  usedYet: boolean("used_yet").default(false).notNull(),
  position: integer(),
  // Optional link to a top-level Resource, narrowed to a module group or
  // single module. Both null = the link targets the whole resource; all
  // three null = no link (legacy / freeform task resource).
  resourceId: varchar("resource_id").references(() => resources.id, {
    onDelete: "set null",
  }),
  moduleGroupId: varchar("module_group_id").references(() => moduleGroups.id, {
    onDelete: "set null",
  }),
  moduleId: varchar("module_id").references(() => modules.id, {
    onDelete: "set null",
  }),
});

// A todo within a Task List, shaped like a Curated Routine entry: it carries a
// status (same 5-state set as routine tasks), an optional due date, optional
// note/location, and an optional link to a single Resource (narrowed to a
// module group or module). All three resource columns null = a plain checklist
// item.
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
  // Optional link to a top-level Resource, narrowed to a module group or single
  // module. Both null = whole-resource link; all three null = no link (plain
  // checklist todo).
  resourceId: varchar("resource_id").references(() => resources.id, {
    onDelete: "set null",
  }),
  moduleGroupId: varchar("module_group_id").references(() => moduleGroups.id, {
    onDelete: "set null",
  }),
  moduleId: varchar("module_id").references(() => modules.id, {
    onDelete: "set null",
  }),
});

// New junction so tasks can reference resources. Optionally narrowed to a
// module group or single module within that resource. A task can hold
// multiple rows per resource (e.g. whole-resource + a specific module).
// Uniqueness of the (taskId, resourceId, moduleGroupId, moduleId) tuple is
// not enforced at the DB level (drizzle-kit can't easily express
// partial-unique on nullable columns); handlers dedupe at write time.
export const tasksToResources = pgTable("tasks_to_courses", {
  id: varchar().primaryKey(),
  taskId: varchar("task_id")
    .notNull()
    .references(() => tasks.id),
  resourceId: varchar("resource_id")
    .notNull()
    .references(() => resources.id),
  moduleGroupId: varchar("module_group_id").references(() => moduleGroups.id, {
    onDelete: "set null",
  }),
  moduleId: varchar("module_id").references(() => modules.id, {
    onDelete: "set null",
  }),
  position: integer(),
});

// Junction associating a task with a Simple Bookmarks bookmark. `bookmarkId` is
// the bookmark's id in the companion app — there is deliberately NO foreign key
// because bookmarks live in a separate database. `title` / `url` are a
// denormalized cache of the bookmark at association time so a task's bookmark
// chips still render when Simple Bookmarks is unreachable. A task can hold
// multiple rows (multiple bookmarks); handlers dedupe by bookmarkId at write
// time. This is the first step of migrating item→resource links to
// item→bookmark links; it coexists with tasks_to_courses.
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
