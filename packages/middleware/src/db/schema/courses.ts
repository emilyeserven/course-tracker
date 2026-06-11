import { boolean, date, integer, numeric, pgTable, varchar } from "drizzle-orm/pg-core";

import {
  interactionDifficultyEnum,
  interactionProgressEnum,
  interactionUnderstandingEnum,
  recurPeriodUnitEnum,
  resourceLevelEnum,
  statusEnum,
} from "./enums";

export const courseProviders = pgTable("courseProviders", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  url: varchar({
    length: 255,
  }).notNull().unique(),
  cost: numeric(),
  isRecurring: boolean(),
  recurDate: date(),
  recurPeriodUnit: recurPeriodUnitEnum().default("years"),
  recurPeriod: integer().default(1),
  isCourseFeesShared: boolean(),
});

// NOTE(resource-rename-followup): the `resources` table plays the role of the
// future top-level Resource entity. Modules and Module Groups attach via
// course_id. When the rename lands, course_id columns become resource_id and
// the Module/ModuleGroup types' `resourceId` field becomes `resourceId`.
export const resources = pgTable("resources", {
  id: varchar().primaryKey(),
  name: varchar({}).notNull(),
  description: varchar(),
  url: varchar({
    length: 255,
  }).unique(),
  isCostFromPlatform: boolean().notNull(),
  progressCurrent: integer(),
  progressTotal: integer(),
  dateExpires: date(),
  isExpires: boolean(),
  cost: numeric(),
  status: statusEnum().default("active"),
  minutesLength: integer(),
  courseProviderId: varchar("course_provider_id"),
  // When true, completion is computed from finished modules rather than from
  // progressCurrent/progressTotal.
  modulesAreExhaustive: boolean("modules_are_exhaustive").default(false).notNull(),
  easeOfStarting: resourceLevelEnum("ease_of_starting"),
  timeNeeded: resourceLevelEnum("time_needed"),
  interactivity: resourceLevelEnum(),
});

export const moduleGroups = pgTable("module_groups", {
  id: varchar().primaryKey(),
  resourceId: varchar("resource_id")
    .notNull()
    .references(() => resources.id),
  name: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  url: varchar(),
  // TODO(modules-ordering-followup): position is queried in ASC order today
  // but there's no UI to set it. Add a reorder UI for module groups (and
  // ungrouped modules at the same top level).
  position: integer(),
  // Direct counts. Used when the group has no enumerated modules — lets
  // the user track progress as just "X of Y done" without listing each
  // module. When the group has enumerated modules, these are ignored
  // and counts derive from those modules.
  totalCount: integer("total_count"),
  completedCount: integer("completed_count"),
  easeOfStarting: resourceLevelEnum("ease_of_starting"),
  timeNeeded: resourceLevelEnum("time_needed"),
  interactivity: resourceLevelEnum(),
});

export const modules = pgTable("modules", {
  id: varchar().primaryKey(),
  resourceId: varchar("resource_id")
    .notNull()
    .references(() => resources.id),
  // Modules can attach directly to a course (no group) or to a module group.
  moduleGroupId: varchar("module_group_id").references(() => moduleGroups.id),
  name: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  url: varchar(),
  // Either an integer (as a string) of exact minutes, or one of the
  // duration bucket keys: extra_short / short / medium / long / extra_long.
  // The runtime migration in startup.ts backfills this from `minutes_length`.
  length: varchar(),
  // TODO(module-length-followup): drop minutesLength once `length` has fully
  // replaced it on the wire. Kept for safety during the additive migration.
  minutesLength: integer("minutes_length"),
  isComplete: boolean("is_complete").default(false).notNull(),
  // TODO(modules-ordering-followup): position is queried in ASC order today
  // but there's no UI to set it. Add a reorder UI for modules within a group
  // (and ungrouped modules) — drag-handle or up/down buttons.
  position: integer(),
  easeOfStarting: resourceLevelEnum("ease_of_starting"),
  timeNeeded: resourceLevelEnum("time_needed"),
  interactivity: resourceLevelEnum(),
});

// Replaces taskResources.usedYet with a richer log. An interaction targets a
// course (= future Resource) and optionally narrows to a module group or
// a single module. At most one of moduleGroupId / moduleId is set; both
// null = the interaction is at the whole-course level.
//
// Note: the column is named resourceId today; when the resources → taskResources
// rename lands, this becomes resourceId.
export const interactions = pgTable("interactions", {
  id: varchar().primaryKey(),
  resourceId: varchar("resource_id")
    .notNull()
    .references(() => resources.id),
  moduleGroupId: varchar("module_group_id").references(() => moduleGroups.id, {
    onDelete: "set null",
  }),
  moduleId: varchar("module_id").references(() => modules.id, {
    onDelete: "set null",
  }),
  date: date().notNull(),
  // Renamed from "status" to "progress" to avoid collision with
  // course.status (lifecycle) — they're different axes.
  progress: interactionProgressEnum().notNull(),
  note: varchar(),
  difficulty: interactionDifficultyEnum(),
  understanding: interactionUnderstandingEnum(),
});
