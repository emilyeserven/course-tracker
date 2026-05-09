import { boolean, date, integer, jsonb, numeric, pgEnum, pgTable, primaryKey, unique, varchar } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export type DailyCompletionStatus = "incomplete" | "touched" | "goal" | "exceeded" | "freeze";

export interface DailyCompletion {
  date: string;
  status?: DailyCompletionStatus;
  note?: string;
}

export interface DailyCriteria {
  incomplete?: string;
  touched?: string;
  goal?: string;
  exceeded?: string;
}

export const usersTable = pgTable("users", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull(),
  age: integer().notNull(),
  test: boolean(),
  email: varchar({
    length: 255,
  }).notNull().unique(),
});

export const recurPeriodUnitEnum = pgEnum("recurPeriodUnit", ["days", "months", "years"]);
export const statusEnum = pgEnum("status", ["active", "inactive", "complete", "paused"]);
export const dailyCompletionStatusEnum = pgEnum("dailyCompletionStatus", ["incomplete", "touched", "goal", "exceeded", "freeze"]);
export const resourceLevelEnum = pgEnum("resourceLevel", ["low", "medium", "high"]);
export const interactionProgressEnum = pgEnum("interaction_progress", ["incomplete", "started", "complete"]);
export const interactionDifficultyEnum = pgEnum("interaction_difficulty", ["easy", "medium", "hard"]);
export const interactionUnderstandingEnum = pgEnum("interaction_understanding", ["none", "basic", "comfortable", "proficient", "mastered"]);

export const topics = pgTable("topics", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull().unique(),
  description: varchar(),
  reason: varchar(),
});

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

export const interactionsRelations = relations(interactions, ({
  one,
}) => ({
  resource: one(resources, {
    fields: [interactions.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [interactions.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [interactions.moduleId],
    references: [modules.id],
  }),
}));

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

export const taskResources = pgTable("task_resources", {
  id: varchar().primaryKey(),
  taskId: varchar("task_id").notNull(),
  name: varchar({
    length: 255,
  }).notNull(),
  url: varchar(),
  easeOfStarting: resourceLevelEnum("ease_of_starting"),
  timeNeeded: resourceLevelEnum("time_needed"),
  interactivity: resourceLevelEnum(),
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
  // TODO(tag-reform-followup): drop this varchar[] column in favor of the
  // taskResourcesToTags junction once the taskResources UI is migrated.
  tags: varchar().array().notNull().default(sql`'{}'::varchar[]`),
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

export const taskResourcesToTags = pgTable(
  "resources_to_tags",
  {
    resourceId: varchar("resource_id")
      .notNull()
      .references(() => taskResources.id),
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

export const topicsToTags = pgTable(
  "topics_to_tags",
  {
    topicId: varchar("topic_id")
      .notNull()
      .references(() => topics.id),
    tagId: varchar("tag_id")
      .notNull()
      .references(() => tags.id),
    position: integer(),
  },
  t => [
    primaryKey({
      columns: [t.topicId, t.tagId],
    }),
  ],
);

export const tagGroupsRelations = relations(tagGroups, ({
  many,
}) => ({
  tags: many(tags),
}));

export const tagsRelations = relations(tags, ({
  one, many,
}) => ({
  group: one(tagGroups, {
    fields: [tags.groupId],
    references: [tagGroups.id],
  }),
  tasksToTags: many(tasksToTags),
  taskResourcesToTags: many(taskResourcesToTags),
  topicsToTags: many(topicsToTags),
}));

export const tasksToTagsRelations = relations(tasksToTags, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [tasksToTags.taskId],
    references: [tasks.id],
  }),
  tag: one(tags, {
    fields: [tasksToTags.tagId],
    references: [tags.id],
  }),
}));

export const taskResourcesToTagsRelations = relations(taskResourcesToTags, ({
  one,
}) => ({
  resource: one(taskResources, {
    fields: [taskResourcesToTags.resourceId],
    references: [taskResources.id],
  }),
  tag: one(tags, {
    fields: [taskResourcesToTags.tagId],
    references: [tags.id],
  }),
}));

export const topicsToTagsRelations = relations(topicsToTags, ({
  one,
}) => ({
  topic: one(topics, {
    fields: [topicsToTags.topicId],
    references: [topics.id],
  }),
  tag: one(tags, {
    fields: [topicsToTags.tagId],
    references: [tags.id],
  }),
}));

export const tasksRelations = relations(tasks, ({
  one, many,
}) => ({
  topic: one(topics, {
    fields: [tasks.topicId],
    references: [topics.id],
  }),
  taskType: one(taskTypes, {
    fields: [tasks.taskTypeId],
    references: [taskTypes.id],
  }),
  tasksToTags: many(tasksToTags),
  tasksToResources: many(tasksToResources),
  resources: many(taskResources),
  todos: many(taskTodos),
  daily: one(dailies, {
    fields: [tasks.id],
    references: [dailies.taskId],
  }),
}));

export const taskTypesRelations = relations(taskTypes, ({
  many,
}) => ({
  tasks: many(tasks),
}));

export const taskResourcesRelations = relations(taskResources, ({
  one, many,
}) => ({
  task: one(tasks, {
    fields: [taskResources.taskId],
    references: [tasks.id],
  }),
  resource: one(resources, {
    fields: [taskResources.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [taskResources.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [taskResources.moduleId],
    references: [modules.id],
  }),
  taskResourcesToTags: many(taskResourcesToTags),
}));

export const taskTodosRelations = relations(taskTodos, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [taskTodos.taskId],
    references: [tasks.id],
  }),
}));

export const courseProviderRelations = relations(courseProviders, ({
  many,
}) => ({
  resources: many(resources),
  dailies: many(dailies),
}));

export const dailiesRelations = relations(dailies, ({
  one,
}) => ({
  courseProvider: one(courseProviders, {
    fields: [dailies.courseProviderId],
    references: [courseProviders.id],
  }),
  resource: one(resources, {
    fields: [dailies.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [dailies.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [dailies.moduleId],
    references: [modules.id],
  }),
  task: one(tasks, {
    fields: [dailies.taskId],
    references: [tasks.id],
  }),
}));

export const resourcesRelations = relations(resources, ({
  one, many,
}) => ({
  courseProvider: one(courseProviders, {
    fields: [resources.courseProviderId],
    references: [courseProviders.id],
  }),
  topicsToResources: many(topicsToResources),
  tasksToResources: many(tasksToResources),
  moduleGroups: many(moduleGroups),
  modules: many(modules),
  interactions: many(interactions),
  dailies: many(dailies),
}));

export const moduleGroupsRelations = relations(moduleGroups, ({
  one, many,
}) => ({
  resource: one(resources, {
    fields: [moduleGroups.resourceId],
    references: [resources.id],
  }),
  modules: many(modules),
  interactions: many(interactions),
}));

export const modulesRelations = relations(modules, ({
  one, many,
}) => ({
  resource: one(resources, {
    fields: [modules.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [modules.moduleGroupId],
    references: [moduleGroups.id],
  }),
  interactions: many(interactions),
}));

export const topicsRelations = relations(topics, ({
  many,
}) => ({
  topicsToResources: many(topicsToResources),
  radarBlips: many(radarBlips),
  domainExclusions: many(domainExcludedTopics),
  domainWithinScope: many(domainWithinScopeTopics),
  topicsToTags: many(topicsToTags),
  tasks: many(tasks),
}));

export interface RadarConfigEntry {
  id: string;
  name: string;
  position: number;
  isAdopted?: boolean;
}

export interface RadarConfig {
  quadrants: RadarConfigEntry[];
  rings: RadarConfigEntry[];
  hasAdoptedSection?: boolean;
}

export const domains = pgTable("domains", {
  id: varchar().primaryKey(),
  title: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  radarConfig: jsonb("radar_config").$type<RadarConfig>().notNull().default({
    quadrants: [],
    rings: [],
  }),
  withinScopeDescription: varchar("within_scope_description"),
  outOfScopeDescription: varchar("out_of_scope_description"),
});

export const domainsRelations = relations(domains, ({
  many,
}) => ({
  radarBlips: many(radarBlips),
  excludedTopics: many(domainExcludedTopics),
  withinScopeTopics: many(domainWithinScopeTopics),
}));

export const domainExcludedTopics = pgTable(
  "domain_excluded_topics",
  {
    topicId: varchar("topic_id")
      .notNull()
      .references(() => topics.id),
    domainId: varchar("domain_id")
      .notNull()
      .references(() => domains.id),
    reason: varchar(),
  },
  t => [
    primaryKey({
      columns: [t.topicId, t.domainId],
    }),
  ],
);

export const domainExcludedTopicsRelations = relations(
  domainExcludedTopics,
  ({
    one,
  }) => ({
    topic: one(topics, {
      fields: [domainExcludedTopics.topicId],
      references: [topics.id],
    }),
    domain: one(domains, {
      fields: [domainExcludedTopics.domainId],
      references: [domains.id],
    }),
  }),
);

export const domainWithinScopeTopics = pgTable(
  "domain_within_scope_topics",
  {
    topicId: varchar("topic_id")
      .notNull()
      .references(() => topics.id),
    domainId: varchar("domain_id")
      .notNull()
      .references(() => domains.id),
  },
  t => [
    primaryKey({
      columns: [t.topicId, t.domainId],
    }),
  ],
);

export const domainWithinScopeTopicsRelations = relations(
  domainWithinScopeTopics,
  ({
    one,
  }) => ({
    topic: one(topics, {
      fields: [domainWithinScopeTopics.topicId],
      references: [topics.id],
    }),
    domain: one(domains, {
      fields: [domainWithinScopeTopics.domainId],
      references: [domains.id],
    }),
  }),
);

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
export const topicsToResourcesRelation = relations(topicsToResources, ({
  one,
}) => ({
  topic: one(topics, {
    fields: [topicsToResources.topicId],
    references: [topics.id],
  }),
  resource: one(resources, {
    fields: [topicsToResources.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [topicsToResources.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [topicsToResources.moduleId],
    references: [modules.id],
  }),
}));

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

export const tasksToResourcesRelations = relations(tasksToResources, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [tasksToResources.taskId],
    references: [tasks.id],
  }),
  resource: one(resources, {
    fields: [tasksToResources.resourceId],
    references: [resources.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [tasksToResources.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [tasksToResources.moduleId],
    references: [modules.id],
  }),
}));

export const radarBlips = pgTable(
  "radar_blips",
  {
    id: varchar().primaryKey(),
    domainId: varchar("domain_id")
      .notNull()
      .references(() => domains.id),
    quadrantId: varchar("quadrant_id"),
    ringId: varchar("ring_id"),
    topicId: varchar("topic_id")
      .notNull()
      .references(() => topics.id),
    description: varchar(),
  },
  t => [
    unique("radar_blips_domain_topic_unique").on(t.domainId, t.topicId),
  ],
);

export const radarBlipsRelations = relations(radarBlips, ({
  one,
}) => ({
  domain: one(domains, {
    fields: [radarBlips.domainId],
    references: [domains.id],
  }),
  topic: one(topics, {
    fields: [radarBlips.topicId],
    references: [topics.id],
  }),
}));
