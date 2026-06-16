import { boolean, date, integer, jsonb, numeric, pgTable, varchar } from "drizzle-orm/pg-core";

import type { ModulesConfig } from "./enums";

import {
  interactionDifficultyEnum,
  interactionProgressEnum,
  interactionUnderstandingEnum,
  moduleStatusEnum,
  recurPeriodUnitEnum,
  resourceLevelEnum,
  resourceTypeEnum,
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
  // Whether this resource is a website or a book. Nullable with a default so
  // drizzle-kit push backfills existing rows; the projection coalesces to
  // "website" (same approach as `status`).
  type: resourceTypeEnum("type").default("website"),
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
  // When true, this resource is its own provider: a separate courseProviders row
  // sharing this resource's id is kept in sync with its name/url (see
  // upsertResource's afterUpsert).
  providerIsSelf: boolean("provider_is_self").default(false).notNull(),
  // When true, completion is computed from finished modules rather than from
  // progressCurrent/progressTotal.
  modulesAreExhaustive: boolean("modules_are_exhaustive").default(false).notNull(),
  // When false, the resource opts out of progress tracking: progress displays
  // (the daily tracker's Progress column, the detail view) render an infinity
  // icon instead of a bar/percentage. Defaults true so existing rows keep
  // tracking after the column is added.
  tracksProgress: boolean("tracks_progress").default(true).notNull(),
  easeOfStarting: resourceLevelEnum("ease_of_starting"),
  timeNeeded: resourceLevelEnum("time_needed"),
  interactivity: resourceLevelEnum(),
  // Per-resource labels for the module hierarchy (group vs module).
  modulesConfig: jsonb("modules_config").$type<ModulesConfig>(),
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
  // For book resources: the page range this group spans. Both optional.
  pageStart: integer("page_start"),
  pageEnd: integer("page_end"),
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
  status: moduleStatusEnum("status").default("unstarted").notNull(),
  // TODO(modules-ordering-followup): position is queried in ASC order today
  // but there's no UI to set it. Add a reorder UI for modules within a group
  // (and ungrouped modules) — drag-handle or up/down buttons.
  position: integer(),
  // For book resources: the page range this module spans. Both optional.
  pageStart: integer("page_start"),
  pageEnd: integer("page_end"),
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
