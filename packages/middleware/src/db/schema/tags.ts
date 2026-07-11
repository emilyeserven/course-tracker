import { integer, pgTable, primaryKey, unique, varchar } from "drizzle-orm/pg-core";

import { moduleGroups, modules, resources } from "./courses";
import { tasks } from "./tasks";

export const tagGroups = pgTable("tag_groups", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull().unique(),
  description: varchar(),
  color: varchar({
    length: 32,
  }),
  position: integer(),
});

export const tags = pgTable(
  "tags",
  {
    id: varchar().primaryKey(),
    groupId: varchar("group_id")
      .notNull()
      .references(() => tagGroups.id),
    name: varchar({
      length: 255,
    }).notNull(),
    color: varchar({
      length: 32,
    }),
    position: integer(),
  },
  t => [
    unique("tags_group_name_unique").on(t.groupId, t.name),
  ],
);

export const tasksToTags = pgTable(
  "tasks_to_tags",
  {
    taskId: varchar("task_id")
      .notNull()
      .references(() => tasks.id),
    tagId: varchar("tag_id")
      .notNull()
      .references(() => tags.id),
    position: integer(),
  },
  t => [
    primaryKey({
      columns: [t.taskId, t.tagId],
    }),
  ],
);

export const resourceTags = pgTable(
  "resource_tags",
  {
    resourceId: varchar("resource_id")
      .notNull()
      .references(() => resources.id),
    tagId: varchar("tag_id")
      .notNull()
      .references(() => tags.id),
    position: integer(),
  },
  t => [
    primaryKey({
      columns: [t.resourceId, t.tagId],
    }),
  ],
);

export const moduleGroupTags = pgTable(
  "module_group_tags",
  {
    moduleGroupId: varchar("module_group_id")
      .notNull()
      .references(() => moduleGroups.id),
    tagId: varchar("tag_id")
      .notNull()
      .references(() => tags.id),
    position: integer(),
  },
  t => [
    primaryKey({
      columns: [t.moduleGroupId, t.tagId],
    }),
  ],
);

export const moduleTags = pgTable(
  "module_tags",
  {
    moduleId: varchar("module_id")
      .notNull()
      .references(() => modules.id),
    tagId: varchar("tag_id")
      .notNull()
      .references(() => tags.id),
    position: integer(),
  },
  t => [
    primaryKey({
      columns: [t.moduleId, t.tagId],
    }),
  ],
);
