import { pgTable, varchar } from "drizzle-orm/pg-core";

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
