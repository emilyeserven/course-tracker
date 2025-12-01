import { boolean, date, integer, numeric, pgEnum, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
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

export const topics = pgTable("topics", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({
    length: 255,
  }).notNull().unique(),
  description: varchar(),
  reason: varchar(),
});

export const courseProviders = pgTable("courseProviders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({
    length: 255,
  }).notNull(),
  description: varchar(),
  url: varchar({
    length: 255,
  }).notNull().unique(),
  cost: numeric(),
  isRecurring: boolean(),
  recurPeriodUnit: recurPeriodUnitEnum().default("years"),
  recurPeriod: integer().default(1),
  isCourseFeesShared: boolean(),
});

export const courses = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({}).notNull(),
  description: varchar(),
  url: varchar({
    length: 255,
  }).notNull().unique(),
  isCostFromPlatform: boolean().notNull(),
  progressCurrent: integer(),
  progressTotal: integer(),
  dateExpires: date(),
  cost: numeric(),
  status: statusEnum().default("active"),
  minutesLength: integer(),
  courseProviderId: integer("course_provider_id"),
});

export const courseProviderRelations = relations(courseProviders, ({
  many,
}) => ({
  courses: many(courses),
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
}));

export const topicsToCourses = pgTable(
  "topics_to_courses",
  {
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id),
    courseId: integer("course_id")
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
