import { boolean, jsonb, pgTable, primaryKey, unique, varchar } from "drizzle-orm/pg-core";

import { topics } from "./topics";

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
    // Marks the topic as "ignored" / out of scope for this domain. Ignored
    // blips are kept off the radar circle and listed in their own section.
    // Their `description` holds the ignore reasoning.
    isIgnored: boolean("is_ignored").notNull().default(false),
  },
  t => [
    unique("radar_blips_domain_topic_unique").on(t.domainId, t.topicId),
  ],
);
