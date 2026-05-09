import { boolean, date, integer, jsonb, numeric, pgEnum, pgTable, primaryKey, unique, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
});

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
  taskId: varchar("task_id").unique(),
  status: statusEnum().default("active"),
  criteria: jsonb().$type<DailyCriteria>().default({}).notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar().primaryKey(),
  name: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  topicId: varchar("topic_id"),
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

export const tasksRelations = relations(tasks, ({
  one, many,
}) => ({
  topic: one(topics, {
    fields: [tasks.topicId],
    references: [topics.id],
  }),
  resources: many(resources),
  todos: many(taskTodos),
  daily: one(dailies, {
    fields: [tasks.id],
    references: [dailies.taskId],
  }),
}));

export const resourcesRelations = relations(resources, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [resources.taskId],
    references: [tasks.id],
  }),
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
  dailies: many(dailies),
}));

export const topicsRelations = relations(topics, ({
  many,
}) => ({
  topicsToCourses: many(topicsToCourses),
  topicsToDomains: many(topicsToDomains),
  radarBlips: many(radarBlips),
  domainExclusions: many(domainExcludedTopics),
  tasks: many(tasks),
}));

export const domains = pgTable("domains", {
  id: varchar().primaryKey(),
  title: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  hasRadar: boolean(),
  withinScopeDescription: varchar("within_scope_description"),
  outOfScopeDescription: varchar("out_of_scope_description"),
});

export const domainsRelations = relations(domains, ({
  many,
}) => ({
  topicsToDomains: many(topicsToDomains),
  radarQuadrants: many(radarQuadrants),
  radarRings: many(radarRings),
  radarBlips: many(radarBlips),
  excludedTopics: many(domainExcludedTopics),
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

export const topicsToDomains = pgTable(
  "topics_to_domains",
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

export const topicsToDomainsRelation = relations(topicsToDomains, ({
  one,
}) => ({
  topic: one(topics, {
    fields: [topicsToDomains.topicId],
    references: [topics.id],
  }),
  domain: one(domains, {
    fields: [topicsToDomains.domainId],
    references: [domains.id],
  }),
}));

export const topicsToCourses = pgTable(
  "topics_to_courses",
  {
    topicId: varchar("topic_id")
      .notNull()
      .references(() => topics.id),
    courseId: varchar("course_id")
      .notNull()
      .references(() => courses.id),
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
}));

export const radarQuadrants = pgTable("radar_quadrants", {
  id: varchar().primaryKey(),
  domainId: varchar("domain_id")
    .notNull()
    .references(() => domains.id),
  name: varchar({
    length: 255,
  }).notNull(),
  position: integer().notNull(),
});

export const radarRings = pgTable("radar_rings", {
  id: varchar().primaryKey(),
  domainId: varchar("domain_id")
    .notNull()
    .references(() => domains.id),
  name: varchar({
    length: 255,
  }).notNull(),
  position: integer().notNull(),
});

export const radarBlips = pgTable(
  "radar_blips",
  {
    id: varchar().primaryKey(),
    domainId: varchar("domain_id")
      .notNull()
      .references(() => domains.id),
    quadrantId: varchar("quadrant_id")
      .notNull()
      .references(() => radarQuadrants.id),
    ringId: varchar("ring_id")
      .notNull()
      .references(() => radarRings.id),
    topicId: varchar("topic_id")
      .notNull()
      .references(() => topics.id),
    description: varchar(),
  },
  t => [
    unique("radar_blips_domain_topic_unique").on(t.domainId, t.topicId),
  ],
);

export const radarQuadrantsRelations = relations(radarQuadrants, ({
  one, many,
}) => ({
  domain: one(domains, {
    fields: [radarQuadrants.domainId],
    references: [domains.id],
  }),
  blips: many(radarBlips),
}));

export const radarRingsRelations = relations(radarRings, ({
  one, many,
}) => ({
  domain: one(domains, {
    fields: [radarRings.domainId],
    references: [domains.id],
  }),
  blips: many(radarBlips),
}));

export const radarBlipsRelations = relations(radarBlips, ({
  one,
}) => ({
  domain: one(domains, {
    fields: [radarBlips.domainId],
    references: [domains.id],
  }),
  quadrant: one(radarQuadrants, {
    fields: [radarBlips.quadrantId],
    references: [radarQuadrants.id],
  }),
  ring: one(radarRings, {
    fields: [radarBlips.ringId],
    references: [radarRings.id],
  }),
  topic: one(topics, {
    fields: [radarBlips.topicId],
    references: [topics.id],
  }),
}));
