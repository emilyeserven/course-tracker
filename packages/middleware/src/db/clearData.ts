import {
  courseProviders,
  resources,
  resourceTags,
  domainExcludedTopics,
  domains,
  domainWithinScopeTopics,
  interactions,
  moduleGroups,
  moduleGroupTags,
  modules,
  moduleTags,
  radarBlips,
  tagGroups,
  tags,
  tasksToResources,
  tasksToTags,
  topics,
  topicsToResources,
  topicsToTags,
} from "@/db/schema";
import { db } from "@/db/index";

export async function clearData() {
  await db.delete(interactions);
  await db.delete(tasksToTags);
  await db.delete(tasksToResources);
  await db.delete(topicsToTags);
  await db.delete(moduleTags);
  await db.delete(moduleGroupTags);
  await db.delete(resourceTags);
  await db.delete(tags);
  await db.delete(tagGroups);
  await db.delete(modules);
  await db.delete(moduleGroups);
  await db.delete(topicsToResources);
  await db.delete(radarBlips);
  await db.delete(domainExcludedTopics);
  await db.delete(domainWithinScopeTopics);
  await db.delete(topics);
  await db.delete(resources);
  await db.delete(courseProviders);
  await db.delete(domains);
}
