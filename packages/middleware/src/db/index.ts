import "dotenv/config";
import * as schema from "@/db/schema";
import { drizzle as LocalDrizzle } from "drizzle-orm/node-postgres";
import { courseProviders, courses } from "@/db/schema";

const db = LocalDrizzle(process.env.DATABASE_URL!, {
  schema,
});

async function main() {
  const uidevData: typeof courseProviders.$inferInsert = {
    name: "ui.dev",
    isRecurring: true,
    recurPeriodUnit: "years",
    recurPeriod: 1,
    isCourseFeesShared: true,
    url: "https://ui.dev/",
  };

  const provider = await db.insert(courseProviders).values([uidevData])
    .onConflictDoNothing().returning();
  console.log("New courses providers created!");
  console.log("provider", provider);

  const coursesData: typeof courses.$inferInsert[] = [{
    name: "react.gg",
    url: "https://ui.dev/c/react",
    isCostFromPlatform: true,
    courseProviderId: provider[0] ? provider[0].id : null,
  }, {
    name: "Typescript",
    url: "https://ui.dev/c/typescript",
    isCostFromPlatform: true,
    courseProviderId: provider[0] ? provider[0].id : null,
  }, {
    name: "Renshuu",
    url: "https://www.renshuu.org",
    isCostFromPlatform: true,
  }];

  await db.insert(courses).values(coursesData)
    .onConflictDoNothing();
  console.log("New courses created!");

  const result = await db.query.courseProviders.findMany({
    with: {
      courses: true,
    },
  });
  console.log("result", result);
}

main();

export { db };
