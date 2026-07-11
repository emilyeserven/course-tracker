import {
  courseProviders,
  dailyCriteriaTemplates,
  dashboardLayouts,
  resources,
  resourceTags,
  interactions,
  moduleGroups,
  moduleGroupTags,
  modules,
  moduleTags,
  routineConnections,
  routines,
  routineTemplates,
  tagGroups,
  tags,
  taskResources,
  tasks,
  tasksToResources,
  tasksToTags,
  taskTodos,
  taskTypes,
  topics,
  topicsToResources,
  topicsToTags,
} from "@/db/schema";
import { db } from "@/db/index";

// Wipes every application table (users excluded — seed re-inserts its fixed
// row idempotently). Order matters: junctions and children go before the
// parents their FKs point at.
export async function clearData() {
  // Junctions / children
  await db.delete(interactions);
  await db.delete(tasksToTags);
  await db.delete(tasksToResources);
  await db.delete(taskResources);
  await db.delete(taskTodos);
  await db.delete(topicsToTags);
  await db.delete(moduleTags);
  await db.delete(moduleGroupTags);
  await db.delete(resourceTags);
  await db.delete(topicsToResources);
  await db.delete(routineConnections);
  // Standalone / parent tables
  await db.delete(tags);
  await db.delete(tagGroups);
  await db.delete(routines);
  await db.delete(routineTemplates);
  await db.delete(dailyCriteriaTemplates);
  await db.delete(dashboardLayouts);
  await db.delete(tasks);
  await db.delete(taskTypes);
  await db.delete(modules);
  await db.delete(moduleGroups);
  await db.delete(topics);
  await db.delete(resources);
  await db.delete(courseProviders);
}
