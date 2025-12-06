import "dotenv/config";
import * as schema from "@/db/schema";
import { drizzle as LocalDrizzle } from "drizzle-orm/node-postgres";
import { seed } from "./seed.ts";
import { courses } from "@/db/schema";

export const db = LocalDrizzle(process.env.DATABASE_URL!, {
  schema,
});

async function main() {
  const currentCourses = await db.select().from(courses);
  const isCourses = currentCourses.length > 0;
  if (!isCourses) {
    await seed();
  }
}

main();
