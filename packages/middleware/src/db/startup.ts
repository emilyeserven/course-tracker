import { db } from "@/db/index";
import { resources } from "@/db/schema";
import { migrateConsolidateRadar } from "./migrateConsolidateRadar.ts";
import { migrateCoursesToResources } from "./migrateCoursesToResources.ts";
import { migrateDailiesToRoutines } from "./migrateDailiesToRoutines.ts";
import { migrateRoutineConnections } from "./migrateRoutineConnections.ts";
import { migrateRoutineLocationToWeekly } from "./migrateRoutineLocationToWeekly.ts";
import { migrateIgnoreBlips } from "./migrateIgnoreBlips.ts";
import { migrateModuleLength } from "./migrateModuleLength.ts";
import { migrateRadarBlips } from "./migrateRadarBlips.ts";
import { migrateTasksToResources } from "./migrateTasksToResources.ts";
import { seed } from "./seed.ts";

export async function runMigrations() {
  // Foundational rename — must run before anything that queries `resources`
  // or `task_resources`, since those tables don't exist under those names
  // until this migration lands.
  try {
    await migrateCoursesToResources();
  }
  catch (err) {
    console.error("Failed to rename courses → resources:", err);
    throw err;
  }

  try {
    await migrateRadarBlips();
  }
  catch (err) {
    console.error("Failed to migrate radar blips:", err);
    throw err;
  }

  try {
    await migrateConsolidateRadar();
  }
  catch (err) {
    console.error("Failed to consolidate domain/radar:", err);
    throw err;
  }

  try {
    await migrateIgnoreBlips();
  }
  catch (err) {
    console.error("Failed to migrate ignored blips:", err);
    throw err;
  }

  try {
    await migrateModuleLength();
  }
  catch (err) {
    console.error("Failed to backfill module length:", err);
    throw err;
  }

  try {
    await migrateTasksToResources();
  }
  catch (err) {
    console.error("Failed to migrate tasks_to_courses to uuid PK:", err);
    throw err;
  }

  // Collapse dailies into daily-mode routines. Runs after the tasks/resources
  // rename since a daily's representative entry points at those tables.
  try {
    await migrateDailiesToRoutines();
  }
  catch (err) {
    console.error("Failed to migrate dailies → routines:", err);
    throw err;
  }

  // Backfill each routine's legacy topic_id into the routine_connections
  // junction. Runs after dailies → routines so every routine row exists first.
  try {
    await migrateRoutineConnections();
  }
  catch (err) {
    console.error("Failed to migrate routine topics → connections:", err);
    throw err;
  }

  // Move each routine's legacy `location` onto its per-day weekly entries, then
  // drop the column. Runs after dailies → routines so every entry exists first.
  try {
    await migrateRoutineLocationToWeekly();
  }
  catch (err) {
    console.error("Failed to migrate routine location → weekly entries:", err);
    throw err;
  }
}

export async function seedIfEmpty() {
  const currentResources = await db.select().from(resources);
  if (currentResources.length === 0) {
    await seed();
  }
}
