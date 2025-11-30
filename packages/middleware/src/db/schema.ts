import { boolean, date, integer, numeric, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
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
  isRecurring: boolean().notNull(),
  recurPeriodUnit: recurPeriodUnitEnum().notNull().default("years"),
  recurPeriod: integer().notNull().default(1),
  isCourseFeesShared: boolean().notNull(),
});

export const courses = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({}).notNull(),
  url: varchar({
    length: 255,
  }).notNull().unique(),
  isCostFromPlatform: boolean().notNull(),
  progressCurrent: integer(),
  progressTotal: integer(),
  dateExpires: date(),
  cost: numeric(),
  status: statusEnum().default("active"),
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
  topics: many(topics),
}));
