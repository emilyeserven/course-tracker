import {
  courseProviders,
  courses,
  domainExcludedTopics,
  domains,
  domainWithinScopeTopics,
  interactions,
  moduleGroups,
  modules,
  radarBlips,
  taskResourcesToTags,
  tagGroups,
  tags,
  tasksToCourses,
  tasksToTags,
  topics,
  topicsToCourses,
  topicsToTags,
} from "@/db/schema";
import { db } from "@/db/index";

export async function clearData() {
  await db.delete(interactions);
  await db.delete(taskResourcesToTags);
  await db.delete(tasksToTags);
  await db.delete(tasksToCourses);
  await db.delete(topicsToTags);
  await db.delete(tags);
  await db.delete(tagGroups);
  await db.delete(modules);
  await db.delete(moduleGroups);
  await db.delete(topicsToCourses);
  await db.delete(radarBlips);
  await db.delete(domainExcludedTopics);
  await db.delete(domainWithinScopeTopics);
  await db.delete(topics);
  await db.delete(courses);
  await db.delete(courseProviders);
  await db.delete(domains);
}
