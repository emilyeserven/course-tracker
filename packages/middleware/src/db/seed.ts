import { courseProviders, courses, topics, topicsToCourses } from "@/db/schema.ts";
import { db } from "@/db/index.ts";
import { clearData } from "@/db/clearData";

export async function seed() {
  await clearData();

  const uidevData: typeof courseProviders.$inferInsert = {
    name: "ui.dev",
    isRecurring: true,
    recurPeriodUnit: "years",
    recurPeriod: 1,
    cost: "396",
    recurDate: "2025/08/22",
    isCourseFeesShared: true,
    url: "https://ui.dev/",
  };
  const satoriReaderData: typeof courseProviders.$inferInsert = {
    name: "Satori Reader",
    isRecurring: true,
    recurPeriodUnit: "years",
    recurPeriod: 1,
    cost: "89",
    recurDate: "2025/11/06",
    isCourseFeesShared: true,
    url: "https://www.satorireader.com/",
  };
  const udemyData: typeof courseProviders.$inferInsert = {
    name: "Udemy",
    isRecurring: false,
    isCourseFeesShared: false,
    url: "https://www.udemy.com/",
  };

  const providerUidev = await db.insert(courseProviders).values([uidevData])
    .onConflictDoNothing().returning();

  const providerSatori = await db.insert(courseProviders).values([satoriReaderData])
    .onConflictDoNothing().returning();

  const providerUdemy = await db.insert(courseProviders).values([udemyData])
    .onConflictDoNothing().returning();

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
    progressCurrent: 0,
    progressTotal: 146,
    status: "active",
    isCostFromPlatform: true,
    courseProviderId: providerUidev[0] ? providerUidev[0].id : null,

  };
  const typescriptCourseData: typeof courses.$inferInsert = {
    name: "Typescript",
    url: "https://ui.dev/c/typescript",
    progressCurrent: 26,
    progressTotal: 113,
    status: "inactive",
    isCostFromPlatform: true,
    courseProviderId: providerUidev[0] ? providerUidev[0].id : null,
  };
  const akikoData: typeof courses.$inferInsert = {
    name: "Akiko's American Foreign Exchange",
    url: "https://www.satorireader.com/series/akiko-nikki",
    progressCurrent: 9,
    progressTotal: 133,
    status: "inactive",
    isCostFromPlatform: true,
    courseProviderId: providerSatori[0] ? providerSatori[0].id : null,
  };
  const npmPackageCourseData: typeof courses.$inferInsert = {
    name: "Creating NPM packages: The Complete Guide",
    url: "https://www.udemy.com/course/creating-npm-packages-the-complete-guide/",
    cost: "10.62",
    isCostFromPlatform: false,
    isExpires: false,
    status: "inactive",
    progressCurrent: 0,
    progressTotal: 74,
    minutesLength: 341,
    courseProviderId: providerUdemy[0] ? providerUdemy[0].id : null,

  };

  const courseReact = await db.insert(courses).values([reactCourseData])
    .onConflictDoNothing().returning();

  const courseTypescript = await db.insert(courses).values([typescriptCourseData])
    .onConflictDoNothing().returning();

  const courseNpmPackage = await db.insert(courses).values([npmPackageCourseData])
    .onConflictDoNothing().returning();

  const courseAkiko = await db.insert(courses).values([akikoData])
    .onConflictDoNothing().returning();

  if (courseReact[0] && topicReact[0]) {
    await db.insert(topicsToCourses).values([{
      courseId: courseReact[0].id,
      topicId: topicReact[0].id,
    }]).onConflictDoNothing();
  }
  if (courseReact[0] && topicTypescript[0]) {
    await db.insert(topicsToCourses).values([{
      courseId: courseReact[0].id,
      topicId: topicTypescript[0].id,
    }]).onConflictDoNothing();
  }
  if (courseTypescript[0] && topicTypescript[0]) {
    await db.insert(topicsToCourses).values([{
      courseId: courseTypescript[0].id,
      topicId: topicTypescript[0].id,
    }]).onConflictDoNothing();
  }
  if (courseNpmPackage[0] && topicTypescript[0]) {
    await db.insert(topicsToCourses).values([{
      courseId: courseNpmPackage[0].id,
      topicId: topicTypescript[0].id,
    }]).onConflictDoNothing();
  }
  if (courseAkiko[0] && topicJapanese[0]) {
    await db.insert(topicsToCourses).values([{
      courseId: courseAkiko[0].id,
      topicId: topicJapanese[0].id,
    }]).onConflictDoNothing();
  }
  console.log("New courses created!");
}
