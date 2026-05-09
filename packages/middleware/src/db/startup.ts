import { db } from "@/db/index";
import { resources } from "@/db/schema";
import { migrateConsolidateRadar } from "./migrateConsolidateRadar.ts";
import { migrateRadarBlips } from "./migrateRadarBlips.ts";
import { seed } from "./seed.ts";

export async function runMigrations() {
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
}

export async function seedIfEmpty() {
  const currentResources = await db.select().from(resources);
  if (currentResources.length === 0) {
    await seed();
  }
}
