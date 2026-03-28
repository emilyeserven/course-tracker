import { courseProviders, courses, topics, topicsToCourses } from "@/db/schema";
import { db } from "@/db/index";

export async function clearData() {
  await db.delete(topicsToCourses);
  await db.delete(topics);
  await db.delete(courses);
  await db.delete(courseProviders);
}
