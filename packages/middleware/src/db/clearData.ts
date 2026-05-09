import {
  courseProviders,
  courses,
  domainExcludedTopics,
  domains,
  domainWithinScopeTopics,
  radarBlips,
  topics,
  topicsToCourses,
} from "@/db/schema";
import { db } from "@/db/index";

export async function clearData() {
  await db.delete(topicsToCourses);
  await db.delete(radarBlips);
  await db.delete(domainExcludedTopics);
  await db.delete(domainWithinScopeTopics);
  await db.delete(topics);
  await db.delete(courses);
  await db.delete(courseProviders);
  await db.delete(domains);
}
