import {
  courseProviders,
  resources,
  dailyCriteriaTemplates,
  domains,
  radarBlips,
  tagGroups,
  tags,
  topics,
  topicsToResources,
  usersTable,
} from "@/db/schema";
import { db } from "@/db/index";
import { clearData } from "@/db/clearData";
import { v4 as uuidv4 } from "uuid";

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

  const topicReactData: typeof topics.$inferInsert = {
    id: "80d8e391-6140-493c-b5a8-2f788d3d1245",
    name: "React",
    description: "That one framework.",
    reason: "That's where the jobs are!",
  };
  const topicTypescriptData: typeof topics.$inferInsert = {
    id: "32574ce7-cd41-4a1f-a860-3bb16641e10f",
    name: "Typescript",
    description: "JavaScript but typier.",
  };
  const topicJapaneseData: typeof topics.$inferInsert = {
    id: "15795947-e6fd-4f17-892d-284906a10c53",
    name: "Japanese",
    reason: "I want to understand anime.",
  };

  const topicDevopsData: typeof topics.$inferInsert = {
    id: "84a376ba-5701-4407-8794-10e24894680b",
    name: "DevOps",
  };

  const topicReact = await db
    .insert(topics)
    .values([topicReactData])
    .onConflictDoNothing()
    .returning();

  const topicTypescript = await db
    .insert(topics)
    .values([topicTypescriptData])
    .onConflictDoNothing()
    .returning();

  const topicJapanese = await db
    .insert(topics)
    .values([topicJapaneseData])
    .onConflictDoNothing()
    .returning();

  await db
    .insert(topics)
    .values([topicDevopsData])
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

  const courseReact = await db
    .insert(resources)
    .values([reactCourseData])
    .onConflictDoNothing()
    .returning();

  const courseTypescript = await db
    .insert(resources)
    .values([typescriptCourseData])
    .onConflictDoNothing()
    .returning();

  const courseNpmPackage = await db
    .insert(resources)
    .values([npmPackageCourseData])
    .onConflictDoNothing()
    .returning();

  const courseAkiko = await db
    .insert(resources)
    .values([akikoData])
    .onConflictDoNothing()
    .returning();

  if (courseReact[0] && topicReact[0]) {
    await db
      .insert(topicsToResources)
      .values([
        {
          resourceId: courseReact[0].id,
          topicId: topicReact[0].id,
        },
      ])
      .onConflictDoNothing();
  }
  if (courseReact[0] && topicTypescript[0]) {
    await db
      .insert(topicsToResources)
      .values([
        {
          resourceId: courseReact[0].id,
          topicId: topicTypescript[0].id,
        },
      ])
      .onConflictDoNothing();
  }
  if (courseTypescript[0] && topicTypescript[0]) {
    await db
      .insert(topicsToResources)
      .values([
        {
          resourceId: courseTypescript[0].id,
          topicId: topicTypescript[0].id,
        },
      ])
      .onConflictDoNothing();
  }
  if (courseNpmPackage[0] && topicTypescript[0]) {
    await db
      .insert(topicsToResources)
      .values([
        {
          resourceId: courseNpmPackage[0].id,
          topicId: topicTypescript[0].id,
        },
      ])
      .onConflictDoNothing();
  }
  if (courseAkiko[0] && topicJapanese[0]) {
    await db
      .insert(topicsToResources)
      .values([
        {
          resourceId: courseAkiko[0].id,
          topicId: topicJapanese[0].id,
        },
      ])
      .onConflictDoNothing();
  }

  const domainWebDevData: typeof domains.$inferInsert = {
    id: "c1a2b3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    title: "Web Development",
    description: "Building applications for the web.",
  };
  const domainLanguageLearningData: typeof domains.$inferInsert = {
    id: "d2b3c4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    title: "Language Learning",
    description: "Studying foreign languages.",
  };

  const domainWebDev = await db
    .insert(domains)
    .values([domainWebDevData])
    .onConflictDoNothing()
    .returning();

  const domainLanguageLearning = await db
    .insert(domains)
    .values([domainLanguageLearningData])
    .onConflictDoNothing()
    .returning();

  const seedBlips: (typeof radarBlips.$inferInsert)[] = [];
  if (domainWebDev[0] && topicReact[0]) {
    seedBlips.push({
      id: uuidv4(),
      domainId: domainWebDev[0].id,
      topicId: topicReact[0].id,
    });
  }
  if (domainWebDev[0] && topicTypescript[0]) {
    seedBlips.push({
      id: uuidv4(),
      domainId: domainWebDev[0].id,
      topicId: topicTypescript[0].id,
    });
  }
  if (domainLanguageLearning[0] && topicJapanese[0]) {
    seedBlips.push({
      id: uuidv4(),
      domainId: domainLanguageLearning[0].id,
      topicId: topicJapanese[0].id,
    });
  }
  if (seedBlips.length > 0) {
    await db.insert(radarBlips).values(seedBlips).onConflictDoNothing();
  }

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
