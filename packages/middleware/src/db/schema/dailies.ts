import { jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

import { statusEnum } from "./enums";

import type { DailyCompletion, DailyCriteria } from "./enums";

export const dailies = pgTable("dailies", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull(),
  location: varchar({
    length: 255,
  }),
  description: varchar(),
  completions: jsonb().$type<DailyCompletion[]>().default([]).notNull(),
  courseProviderId: varchar("course_provider_id"),
  resourceId: varchar("resource_id"),
  // Optional sub-target within the linked course. At most one of these
  // should be set (TODO: enforce via CHECK constraint when Drizzle support
  // lands). Both null = the daily targets the whole course.
  moduleGroupId: varchar("module_group_id"),
  moduleId: varchar("module_id"),
  taskId: varchar("task_id").unique(),
  status: statusEnum().default("active"),
  criteria: jsonb().$type<DailyCriteria>().default({}).notNull(),
});

export const dailyCriteriaTemplates = pgTable("daily_criteria_templates", {
  id: varchar().primaryKey(),
  label: varchar({
    length: 255,
  }).notNull(),
  incomplete: varchar().notNull().default(""),
  touched: varchar().notNull().default(""),
  goal: varchar().notNull().default(""),
  exceeded: varchar().notNull().default(""),
  freeze: varchar().notNull().default(""),
});
