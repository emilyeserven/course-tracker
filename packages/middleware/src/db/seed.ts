import {
  courseProviders,
  resources,
  dailyCriteriaTemplates,
  tagGroups,
  tags,
  usersTable,
} from "@/db/schema";
import { db } from "@/db/index";
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

  const providerUidev = await db
    .insert(courseProviders)
    .values([uidevData])
    .onConflictDoNothing()
    .returning();

  const providerSatori = await db
    .insert(courseProviders)
    .values([satoriReaderData])
    .onConflictDoNothing()
    .returning();

  const providerUdemy = await db
    .insert(courseProviders)
    .values([udemyData])
    .onConflictDoNothing()
    .returning();

  const reactCourseData: typeof resources.$inferInsert = {
    id: "67059232-ed82-43fc-8e9f-15c23a1d32aa",
    name: "react.gg",
    description: "React course with videos and graphics.",
    url: "https://ui.dev/c/react",
    progressCurrent: 0,
    progressTotal: 146,
    status: "active",
    isCostFromPlatform: true,
    courseProviderId: providerUidev[0] ? providerUidev[0].id : null,
  };
  const typescriptCourseData: typeof resources.$inferInsert = {
    id: "e09b541d-8e03-4d00-9f7e-bd75acd0c903",
    name: "Typescript",
    url: "https://ui.dev/c/typescript",
    progressCurrent: 26,
    progressTotal: 113,
    status: "inactive",
    isCostFromPlatform: true,
    courseProviderId: providerUidev[0] ? providerUidev[0].id : null,
  };
  const akikoData: typeof resources.$inferInsert = {
    id: "05ea0e1b-74d7-4710-9a67-1b04556c6553",
    name: "Akiko's American Foreign Exchange",
    description: "Story with accessible Japanese.",
    url: "https://www.satorireader.com/series/akiko-nikki",
    progressCurrent: 9,
    progressTotal: 133,
    status: "inactive",
    isCostFromPlatform: true,
    courseProviderId: providerSatori[0] ? providerSatori[0].id : null,
  };
  const npmPackageCourseData: typeof resources.$inferInsert = {
    id: "664b3245-6505-416f-b959-4c82a3573b12",
    name: "Creating NPM packages: The Complete Guide",
    description: "NPM packages are their own art...",
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

  await db
    .insert(resources)
    .values([reactCourseData])
    .onConflictDoNothing()
    .returning();

  await db
    .insert(resources)
    .values([typescriptCourseData])
    .onConflictDoNothing()
    .returning();

  await db
    .insert(resources)
    .values([npmPackageCourseData])
    .onConflictDoNothing()
    .returning();

  await db
    .insert(resources)
    .values([akikoData])
    .onConflictDoNothing()
    .returning();

  await db
    .insert(usersTable)
    .values([
      {
        id: "1",
        name: "Name",
        email: "name@email.com",
        age: 30,
      },
    ])
    .onConflictDoNothing();

  const skillsGroupData: typeof tagGroups.$inferInsert = {
    id: "9b2a1c40-8d3a-4d6c-9f2a-1e30c8d2a401",
    name: "skills",
    description: "Specific skill areas",
    position: 0,
  };
  const formatGroupData: typeof tagGroups.$inferInsert = {
    id: "9b2a1c40-8d3a-4d6c-9f2a-1e30c8d2a402",
    name: "format",
    description: "Resource format / medium",
    position: 1,
  };

  const skillsGroup = await db
    .insert(tagGroups)
    .values([skillsGroupData])
    .onConflictDoNothing()
    .returning();

  const formatGroup = await db
    .insert(tagGroups)
    .values([formatGroupData])
    .onConflictDoNothing()
    .returning();

  if (skillsGroup[0]) {
    await db
      .insert(tags)
      .values([
        {
          id: "a3f4d2c1-1111-4111-9111-111111111101",
          groupId: skillsGroup[0].id,
          name: "skills:listening",
          position: 0,
        },
        {
          id: "a3f4d2c1-1111-4111-9111-111111111102",
          groupId: skillsGroup[0].id,
          name: "skills:reading",
          position: 1,
        },
        {
          id: "a3f4d2c1-1111-4111-9111-111111111103",
          groupId: skillsGroup[0].id,
          name: "skills:writing",
          position: 2,
        },
      ])
      .onConflictDoNothing();
  }

  if (formatGroup[0]) {
    await db
      .insert(tags)
      .values([
        {
          id: "a3f4d2c1-2222-4222-9222-222222222201",
          groupId: formatGroup[0].id,
          name: "format:video",
          position: 0,
        },
        {
          id: "a3f4d2c1-2222-4222-9222-222222222202",
          groupId: formatGroup[0].id,
          name: "format:article",
          position: 1,
        },
        {
          id: "a3f4d2c1-2222-4222-9222-222222222203",
          groupId: formatGroup[0].id,
          name: "format:interactive",
          position: 2,
        },
      ])
      .onConflictDoNothing();
  }

  await db
    .insert(dailyCriteriaTemplates)
    .values([
      {
        id: "8c3f1a52-1c2c-4c84-9e7f-0b1a4b1c0d11",
        label: "Book Rules",
        incomplete: "Book was not touched",
        touched: "At least a paragraph was read",
        goal: "A chapter was read",
        exceeded: "More than 1 chapter was read, or a lab was completed",
        freeze: "A different book was read",
      },
      {
        id: "8c3f1a52-1c2c-4c84-9e7f-0b1a4b1c0d22",
        label: "Daily Drill Rules",
        incomplete: "Did not do reviews",
        touched: "Did 1 round of reviews, or at least 5 questions",
        goal: "Did assigned reviews",
        exceeded: "Did at least 1 round of reviews more than assigned",
        freeze: "Did work in the same area",
      },
    ])
    .onConflictDoNothing();
}
