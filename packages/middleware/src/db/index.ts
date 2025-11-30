import "dotenv/config";
import { drizzle as LocalDrizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { courseProviders, courses } from "@/db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle as NeonDrizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

let db:
  | NeonHttpDatabase<Record<string, never>>
  | NodePgDatabase<Record<string, never>>;
if (process.env.NODE_ENV === "production") {
  console.log("Using Neon DB");
  const sql = neon(process.env.DATABASE_URL!);
  db = NeonDrizzle({
    client: sql,
  });
}
else {
  console.log("Using local DB");
  console.log(process.env);

  db = LocalDrizzle(process.env.DATABASE_URL!);
}

async function main() {
  const uidevData: typeof courseProviders.$inferInsert = {
    name: "ui.dev",
    isRecurring: true,
    recurPeriodUnit: "years",
    recurPeriod: 1,
    isCourseFeesShared: true,
    url: "https://ui.dev/",
  };
  const coursesData: typeof courses.$inferInsert[] = [{
    name: "react.gg",
    url: "https://ui.dev/c/react",
    isCostFromPlatform: true,
  }, {
    name: "Typescript",
    url: "https://ui.dev/c/typescript",
    isCostFromPlatform: true,
  }, {
    name: "Renshuu",
    url: "https://www.renshuu.org",
    isCostFromPlatform: true,
  }];

  await db.insert(courses).values(coursesData)
    .onConflictDoNothing();
  console.log("New courses created!");

  await db.insert(courseProviders).values([uidevData])
    .onConflictDoNothing();
  console.log("New courses providers created!");

  const users = await db.select().from(courses);
  console.log("Getting all users from the database: ", users);
}

main();

export { db };
