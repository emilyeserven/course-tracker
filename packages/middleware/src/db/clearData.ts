import { courseProviders, courses, domains, topics, topicsToCourses, topicsToDomains } from "@/db/schema";
import { db } from "@/db/index";

export async function clearData() {
  await db.delete(topicsToCourses);
  await db.delete(topicsToDomains);
  await db.delete(topics);
  await db.delete(courses);
  await db.delete(courseProviders);
  await db.delete(domains);
}
