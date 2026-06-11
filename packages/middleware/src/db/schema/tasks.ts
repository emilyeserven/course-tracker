import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { moduleGroups, modules, resources } from "./courses";

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
  topicId: varchar("topic_id"),
  // TODO(tag-reform-followup): drop taskTypeId once the new Tag Groups + Tags
  // system fully replaces Task Types on tasks.
  taskTypeId: varchar("task_type_id"),
});

// Task-local resource entries for things that don't (yet) warrant a real
// top-level Resource. Ease/time/interactivity/tags now live on Resource,
// ModuleGroup, and Module — a task that links to one of those inherits the
// metadata from the linked entity rather than overriding it here.
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

export const taskTodos = pgTable("task_todos", {
  id: varchar().primaryKey(),
  taskId: varchar("task_id").notNull(),
  name: varchar({
    length: 500,
  }).notNull(),
  isComplete: boolean("is_complete").default(false).notNull(),
  url: varchar(),
  position: integer(),
});

// New junction so tasks can reference resources. Optionally narrowed to a
// module group or single module within that resource. A task can hold
// multiple rows per resource (e.g. whole-resource + a specific module);
// uniqueness is enforced on the (taskId, resourceId, moduleGroupId, moduleId)
// tuple via a runtime migration on startup, since drizzle-kit can't easily
// express partial-unique on nullable columns.
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
