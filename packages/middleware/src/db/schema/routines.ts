import { integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

import { routineModeEnum, statusEnum } from "./enums";

import type {
  DailyCompletion,
  DailyCriteria,
  RoutineConnectionType,
  RoutineCurated,
  RoutineWeekly,
} from "./enums";

// A plan that also carries daily completion tracking. In "weekly" mode each day
// of the week optionally points at a Task or Resource; in "daily" mode the same
// entry is applied to every day; in "curated" mode the `curated` map points each
// calendar date (today up to a chosen end date) at its own item. A routine's
// categorical links live in the `routine_connections` junction (many
// Topics/Tasks/Resources); any number may be "active" at once.
export const routines = pgTable("routines", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  status: statusEnum().default("active"),
  weekly: jsonb().$type<RoutineWeekly>().default({}).notNull(),
  // Curated-mode schedule (date-keyed). Default empty for weekly/daily routines.
  curated: jsonb()
    .$type<RoutineCurated>()
    .default({
      endDate: null,
      entries: {},
    })
    .notNull(),
  mode: routineModeEnum().default("weekly").notNull(),
  completions: jsonb().$type<DailyCompletion[]>().default([]).notNull(),
  criteria: jsonb().$type<DailyCriteria>().default({}).notNull(),
  // For daily-mode routines: how many days a week the routine needs to be done.
  // NULL means no target (do it every day). Days marked goal/exceeded count.
  weeklyTarget: integer("weekly_target"),
});

// Polymorphic many-to-many link from a routine to Topics, Tasks, and/or
// Resources. UUID PK so a routine can hold multiple links (mirrors
// topics_to_resources / tasks_to_resources). `connected_id` has no FK because
// it points at one of three tables; dangling rows (target deleted) are dropped
// at read time, exactly like dangling weekly-grid entries.
export const routineConnections = pgTable("routine_connections", {
  id: varchar().primaryKey(),
  routineId: varchar("routine_id")
    .notNull()
    .references(() => routines.id),
  connectedType: varchar("connected_type").$type<RoutineConnectionType>().notNull(),
  connectedId: varchar("connected_id").notNull(),
  position: integer(),
});

// Reusable weekly layouts that pre-fill a routine's weekly schedule.
export const routineTemplates = pgTable("routine_templates", {
  id: varchar().primaryKey(),
  label: varchar({
    length: 255,
  }).notNull(),
  weekly: jsonb().$type<RoutineWeekly>().default({}).notNull(),
});
