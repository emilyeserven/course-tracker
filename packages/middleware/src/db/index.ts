import "dotenv/config";
import * as schema from "@/db/schema";
import { drizzle as LocalDrizzle } from "drizzle-orm/node-postgres";
import { seed } from "./seed.ts";
import { migrateRadarBlips } from "./migrateRadarBlips.ts";
import { courses } from "@/db/schema";

export const db = LocalDrizzle(process.env.DATABASE_URL!, {
  schema,
});

async function main() {
  try {
    await migrateRadarBlips();
  }
  catch (err) {
    console.error("Failed to migrate radar blips:", err);
  }

  const currentCourses = await db.select().from(courses);
  const isCourses = currentCourses.length > 0;
  if (!isCourses) {
    await seed();
  }
}

main();
