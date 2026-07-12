import {
  dailyCriteriaTemplates,
  tagGroups,
  tags,
  usersTable,
} from "@/db/schema";
import { db } from "@/db/index";
import { clearData } from "@/db/clearData";

export async function seed() {
  await clearData();

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
    description: "Content format / medium",
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
