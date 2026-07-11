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

// Polymorphic many-to-many link from a routine to Topics, Tasks, Resources,
// and/or external Simple Bookmarks bookmarks. UUID PK so a routine can hold
// multiple links (mirrors topics_to_resources / tasks_to_resources).
// `connected_id` has no FK because it points at one of several tables (or an
// external bookmark). For local types, dangling rows (target deleted) are
// dropped at read time. For "bookmark", there is no local row to resolve, so the
// display title/url are cached here (cached_title/cached_url) and such rows are
// never auto-dropped — matching the task/todo bookmark chips.
export const routineConnections = pgTable("routine_connections", {
  id: varchar().primaryKey(),
  routineId: varchar("routine_id")
    .notNull()
    .references(() => routines.id),
  connectedType: varchar("connected_type").$type<RoutineConnectionType>().notNull(),
  connectedId: varchar("connected_id").notNull(),
  // Cached label for "bookmark" connections (null for local types).
  cachedTitle: varchar("cached_title"),
  cachedUrl: varchar("cached_url"),
  // Bookmark connections only: optional narrowing to a section (null = whole
  // bookmark). `section_id` is the external SectionEntry id; `section_label` the
  // cached label.
  sectionId: varchar("section_id"),
  sectionLabel: varchar("section_label"),
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
