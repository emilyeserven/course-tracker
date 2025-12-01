import "dotenv/config";
import * as schema from "@/db/schema";
import { drizzle as LocalDrizzle } from "drizzle-orm/node-postgres";
import { courseProviders, courses, topics, topicsToCourses } from "@/db/schema";

export const db = LocalDrizzle(process.env.DATABASE_URL!, {
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

  const providerUidev = await db.insert(courseProviders).values([uidevData])
    .onConflictDoNothing().returning();
  console.log("New courses providers created!");

  const topicReactData: typeof topics.$inferInsert = {
    name: "React",
  };
  const topicTypescriptData: typeof topics.$inferInsert = {
    name: "Typescript",
  };
  const topicJapaneseData: typeof topics.$inferInsert = {
    name: "Japanese",
  };

  const topicDevopsData: typeof topics.$inferInsert = {
    name: "DevOps",
  };

  const topicReact = await db.insert(topics).values([topicReactData])
    .onConflictDoNothing().returning();

  const topicTypescript = await db.insert(topics).values([topicTypescriptData])
    .onConflictDoNothing().returning();

  const topicJapanese = await db.insert(topics).values([topicJapaneseData])
    .onConflictDoNothing().returning();

  await db.insert(topics).values([topicDevopsData])
    .onConflictDoNothing().returning();

  const reactCourseData: typeof courses.$inferInsert = {
    name: "react.gg",
    url: "https://ui.dev/c/react",
    isCostFromPlatform: true,
    courseProviderId: providerUidev[0] ? providerUidev[0].id : null,
  };
  const typescriptCourseData: typeof courses.$inferInsert = {
    name: "Typescript",
    url: "https://ui.dev/c/typescript",
    isCostFromPlatform: true,
    courseProviderId: providerUidev[0] ? providerUidev[0].id : null,
  };
  const renshuuCourseData: typeof courses.$inferInsert = {
    name: "Renshuu",
    url: "https://www.renshuu.org",
    isCostFromPlatform: true,
  };

  const courseReact = await db.insert(courses).values([reactCourseData])
    .onConflictDoNothing().returning();

  const courseTypescript = await db.insert(courses).values([typescriptCourseData])
    .onConflictDoNothing().returning();

  const courseRenshuu = await db.insert(courses).values([renshuuCourseData])
    .onConflictDoNothing().returning();

  if (courseReact[0] && topicReact[0]) {
    await db.insert(topicsToCourses).values([{
      courseId: courseReact[0].id,
      topicId: topicReact[0].id,
    }]).onConflictDoNothing();
  }
  if (courseTypescript[0] && topicTypescript[0]) {
    await db.insert(topicsToCourses).values([{
      courseId: courseTypescript[0].id,
      topicId: topicTypescript[0].id,
    }]).onConflictDoNothing();
  }
  if (courseRenshuu[0] && topicJapanese[0]) {
    await db.insert(topicsToCourses).values([{
      courseId: courseRenshuu[0].id,
      topicId: topicJapanese[0].id,
    }]).onConflictDoNothing();
  }
  console.log("New courses created!");
}

main();
