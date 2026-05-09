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

// NOTE(resource-rename-followup): the `courses` table plays the role of the
// future top-level Resource entity. Modules and Module Groups attach via
// course_id. When the rename lands, course_id columns become resource_id and
// the Module/ModuleGroup types' `courseId` field becomes `resourceId`.
export const courses = pgTable("courses", {
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
  courseId: varchar("course_id")
    .notNull()
    .references(() => courses.id),
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
  courseId: varchar("course_id")
    .notNull()
    .references(() => courses.id),
  // Modules can attach directly to a course (no group) or to a module group.
  moduleGroupId: varchar("module_group_id").references(() => moduleGroups.id),
  name: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  url: varchar(),
  minutesLength: integer("minutes_length"),
  isComplete: boolean("is_complete").default(false).notNull(),
  // TODO(modules-ordering-followup): position is queried in ASC order today
  // but there's no UI to set it. Add a reorder UI for modules within a group
  // (and ungrouped modules) — drag-handle or up/down buttons.
  position: integer(),
});

// Replaces resources.usedYet with a richer log. An interaction targets a
// course (= future Resource) and optionally narrows to a module group or
// a single module. At most one of moduleGroupId / moduleId is set; both
// null = the interaction is at the whole-course level.
//
// Note: the column is named courseId today; when the courses → resources
// rename lands, this becomes resourceId.
export const interactions = pgTable("interactions", {
  id: varchar().primaryKey(),
  courseId: varchar("course_id")
    .notNull()
    .references(() => courses.id),
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
  course: one(courses, {
    fields: [interactions.courseId],
    references: [courses.id],
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
  courseId: varchar("course_id"),
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

export const resources = pgTable("resources", {
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
  // TODO(tag-reform-followup): drop this varchar[] column in favor of the
  // resourcesToTags junction once the resources UI is migrated.
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

export const resourcesToTags = pgTable(
  "resources_to_tags",
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
  resourcesToTags: many(resourcesToTags),
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

export const resourcesToTagsRelations = relations(resourcesToTags, ({
  one,
}) => ({
  resource: one(resources, {
    fields: [resourcesToTags.resourceId],
    references: [resources.id],
  }),
  tag: one(tags, {
    fields: [resourcesToTags.tagId],
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
  tasksToCourses: many(tasksToCourses),
  resources: many(resources),
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

export const resourcesRelations = relations(resources, ({
  one, many,
}) => ({
  task: one(tasks, {
    fields: [resources.taskId],
    references: [tasks.id],
  }),
  resourcesToTags: many(resourcesToTags),
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
  courses: many(courses),
  dailies: many(dailies),
}));

export const dailiesRelations = relations(dailies, ({
  one,
}) => ({
  courseProvider: one(courseProviders, {
    fields: [dailies.courseProviderId],
    references: [courseProviders.id],
  }),
  course: one(courses, {
    fields: [dailies.courseId],
    references: [courses.id],
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

export const coursesRelations = relations(courses, ({
  one, many,
}) => ({
  courseProvider: one(courseProviders, {
    fields: [courses.courseProviderId],
    references: [courseProviders.id],
  }),
  topicsToCourses: many(topicsToCourses),
  tasksToCourses: many(tasksToCourses),
  moduleGroups: many(moduleGroups),
  modules: many(modules),
  interactions: many(interactions),
  dailies: many(dailies),
}));

export const moduleGroupsRelations = relations(moduleGroups, ({
  one, many,
}) => ({
  course: one(courses, {
    fields: [moduleGroups.courseId],
    references: [courses.id],
  }),
  modules: many(modules),
  interactions: many(interactions),
}));

export const modulesRelations = relations(modules, ({
  one, many,
}) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
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
  topicsToCourses: many(topicsToCourses),
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
}

export interface RadarConfig {
  quadrants: RadarConfigEntry[];
  rings: RadarConfigEntry[];
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

export const topicsToCourses = pgTable(
  "topics_to_courses",
  {
    topicId: varchar("topic_id")
      .notNull()
      .references(() => topics.id),
    courseId: varchar("course_id")
      .notNull()
      .references(() => courses.id),
    // Optional sub-target within the linked course. At most one of these
    // should be set (TODO: CHECK constraint). Both null = whole course.
    moduleGroupId: varchar("module_group_id").references(() => moduleGroups.id, {
      onDelete: "set null",
    }),
    moduleId: varchar("module_id").references(() => modules.id, {
      onDelete: "set null",
    }),
  },
  t => [
    primaryKey({
      columns: [t.topicId, t.courseId],
    }),
  ],
);
export const topicsToCoursesRelation = relations(topicsToCourses, ({
  one,
}) => ({
  topic: one(topics, {
    fields: [topicsToCourses.topicId],
    references: [topics.id],
  }),
  course: one(courses, {
    fields: [topicsToCourses.courseId],
    references: [courses.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [topicsToCourses.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [topicsToCourses.moduleId],
    references: [modules.id],
  }),
}));

// New junction so tasks can reference courses (the future "Resources").
// Optionally narrowed to a module group or single module within that course.
export const tasksToCourses = pgTable(
  "tasks_to_courses",
  {
    taskId: varchar("task_id")
      .notNull()
      .references(() => tasks.id),
    courseId: varchar("course_id")
      .notNull()
      .references(() => courses.id),
    moduleGroupId: varchar("module_group_id").references(() => moduleGroups.id, {
      onDelete: "set null",
    }),
    moduleId: varchar("module_id").references(() => modules.id, {
      onDelete: "set null",
    }),
    position: integer(),
  },
  t => [
    primaryKey({
      columns: [t.taskId, t.courseId],
    }),
  ],
);

export const tasksToCoursesRelations = relations(tasksToCourses, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [tasksToCourses.taskId],
    references: [tasks.id],
  }),
  course: one(courses, {
    fields: [tasksToCourses.courseId],
    references: [courses.id],
  }),
  moduleGroup: one(moduleGroups, {
    fields: [tasksToCourses.moduleGroupId],
    references: [moduleGroups.id],
  }),
  module: one(modules, {
    fields: [tasksToCourses.moduleId],
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
