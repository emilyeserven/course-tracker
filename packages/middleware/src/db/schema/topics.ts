import { pgTable, varchar } from "drizzle-orm/pg-core";

import { moduleGroups, modules, resources } from "./courses";

export const topics = pgTable("topics", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull().unique(),
  description: varchar(),
  reason: varchar(),
});

// A topic can hold multiple links per Resource (e.g. whole-resource + a
// specific module). At most one of moduleGroupId / moduleId is set per row.
// The runtime migration on startup converts the legacy composite PK to a
// uuid `id` PK so multi-row links are allowed.
export const topicsToResources = pgTable("topics_to_courses", {
  id: varchar().primaryKey(),
  topicId: varchar("topic_id")
    .notNull()
    .references(() => topics.id),
  resourceId: varchar("resource_id")
    .notNull()
    .references(() => resources.id),
  moduleGroupId: varchar("module_group_id").references(() => moduleGroups.id, {
    onDelete: "set null",
  }),
  moduleId: varchar("module_id").references(() => modules.id, {
    onDelete: "set null",
  }),
});
