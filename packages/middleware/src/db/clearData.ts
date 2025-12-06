import { courseProviders, courses, topics, topicsToCourses } from "@/db/schema.ts";
import { db } from "@/db/index.ts";

export async function clearData() {
  await db.delete(topicsToCourses);
  await db.delete(topics);
  await db.delete(courses);
  await db.delete(courseProviders);
}
