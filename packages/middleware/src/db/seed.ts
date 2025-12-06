import { courseProviders, courses, topics, topicsToCourses, usersTable } from "@/db/schema.ts";
import { db } from "@/db/index.ts";
import { clearData } from "@/db/clearData";

export async function seed() {
  await clearData();

  const uidevData: typeof courseProviders.$inferInsert = {
    id: "aab7a7c4-e776-45f3-84fa-7c966bb6b36b",
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
    id: "82baa63a-d363-4587-840c-41abf0da53f0",
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
    id: "e3bf9848-c7b7-4791-a868-020df4187e94",
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
    id: "80d8e391-6140-493c-b5a8-2f788d3d1245",
    name: "React",
  };
  const topicTypescriptData: typeof topics.$inferInsert = {
    id: "32574ce7-cd41-4a1f-a860-3bb16641e10f",
    name: "Typescript",
  };
  const topicJapaneseData: typeof topics.$inferInsert = {
    id: "15795947-e6fd-4f17-892d-284906a10c53",
    name: "Japanese",
  };

  const topicDevopsData: typeof topics.$inferInsert = {
    id: "84a376ba-5701-4407-8794-10e24894680b",
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
    id: "67059232-ed82-43fc-8e9f-15c23a1d32aa",
    name: "react.gg",
    url: "https://ui.dev/c/react",
    progressCurrent: 0,
    progressTotal: 146,
    status: "active",
    isCostFromPlatform: true,
    courseProviderId: providerUidev[0] ? providerUidev[0].id : null,

  };
  const typescriptCourseData: typeof courses.$inferInsert = {
    id: "e09b541d-8e03-4d00-9f7e-bd75acd0c903",
    name: "Typescript",
    url: "https://ui.dev/c/typescript",
    progressCurrent: 26,
    progressTotal: 113,
    status: "inactive",
    isCostFromPlatform: true,
    courseProviderId: providerUidev[0] ? providerUidev[0].id : null,
  };
  const akikoData: typeof courses.$inferInsert = {
    id: "05ea0e1b-74d7-4710-9a67-1b04556c6553",
    name: "Akiko's American Foreign Exchange",
    url: "https://www.satorireader.com/series/akiko-nikki",
    progressCurrent: 9,
    progressTotal: 133,
    status: "inactive",
    isCostFromPlatform: true,
    courseProviderId: providerSatori[0] ? providerSatori[0].id : null,
  };
  const npmPackageCourseData: typeof courses.$inferInsert = {
    id: "664b3245-6505-416f-b959-4c82a3573b12",
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

  await db.insert(usersTable).values([{
    id: "1",
    name: "Name",
    email: "name@email.com",
    age: 30,
  }]).onConflictDoNothing();
  console.log("New courses created!");
}
