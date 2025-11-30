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

export const courseProviders = pgTable("courseProviders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({
    length: 255,
  }).notNull(),
  url: varchar({
    length: 255,
  }).notNull(),
  cost: numeric(),
  isRecurring: boolean().notNull(),
  recurPeriodUnit: recurPeriodUnitEnum(),
  recurPeriod: integer().notNull(),
  isCourseFeesShared: boolean().notNull(),
});

export const courses = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({}).notNull(),
  url: varchar({
    length: 255,
  }).notNull(),
  isCostFromPlatform: boolean().notNull(),
  progressCurrent: integer(),
  progressTotal: integer(),
  dateExpires: date(),
  cost: numeric(),
  status: statusEnum(),
  courseProviderId: integer("course_provider_id"),
});

export const courseProviderRelations = relations(courseProviders, ({
  many,
}) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({
  one,
}) => ({
  courseProvider: one(courseProviders, {
    fields: [courses.courseProviderId],
    references: [courseProviders.id],
  }),
}));
