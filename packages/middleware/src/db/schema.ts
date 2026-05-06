import { boolean, date, integer, jsonb, numeric, pgEnum, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export type DailyCompletionStatus = "incomplete" | "touched" | "goal" | "exceeded";

export interface DailyCompletion {
  date: string;
  status: DailyCompletionStatus;
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
export const statusEnum = pgEnum("status", ["active", "inactive", "complete"]);
export const dailyCompletionStatusEnum = pgEnum("dailyCompletionStatus", ["incomplete", "touched", "goal", "exceeded"]);

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
});

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
}));

export const coursesRelations = relations(courses, ({
  one, many,
}) => ({
  courseProvider: one(courseProviders, {
    fields: [courses.courseProviderId],
    references: [courseProviders.id],
  }),
  topicsToCourses: many(topicsToCourses),
}));

export const topicsRelations = relations(topics, ({
  many,
}) => ({
  topicsToCourses: many(topicsToCourses),
  topicsToDomains: many(topicsToDomains),
}));

export const domains = pgTable("domains", {
  id: varchar().primaryKey(),
  title: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  hasRadar: boolean(),
});

export const domainsRelations = relations(domains, ({
  many,
}) => ({
  topicsToDomains: many(topicsToDomains),
}));

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
