import {
  dailyCriteriaTemplates,
  dashboardLayouts,
  routineConnections,
  routines,
  routineTemplates,
  tagGroups,
  tags,
  taskBookmarks,
  tasks,
  tasksToTags,
  taskTodos,
  taskTypes,
  todoBookmarks,
} from "@/db/schema";
import { db } from "@/db/index";

// Wipes every application table (users excluded — seed re-inserts its fixed
// row idempotently). Order matters: junctions and children go before the
// parents their FKs point at.
export async function clearData() {
  // Junctions / children
  await db.delete(todoBookmarks);
  await db.delete(taskBookmarks);
  await db.delete(tasksToTags);
  await db.delete(taskTodos);
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
}
