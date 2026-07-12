// All relations() declarations live together in this module: relations are
// eager and cross-domain, so spreading them across the per-domain table files
// would create real ESM import cycles. Table files only reference each other
// through lazy FK callbacks, which is safe.
import { relations } from "drizzle-orm";

import { routineConnections, routines } from "./routines";
import { tagGroups, tags, tasksToTags } from "./tags";
import { taskBookmarks, tasks, taskTodos, taskTypes, todoBookmarks } from "./tasks";

export const tagGroupsRelations = relations(tagGroups, ({
  many,
}) => ({
  tags: many(tags),
}));

export const tagsRelations = relations(tags, ({
  one, many,
}) => ({
  group: one(tagGroups, {
    fields: [tags.groupId],
    references: [tagGroups.id],
  }),
  tasksToTags: many(tasksToTags),
}));

export const tasksToTagsRelations = relations(tasksToTags, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [tasksToTags.taskId],
    references: [tasks.id],
  }),
  tag: one(tags, {
    fields: [tasksToTags.tagId],
    references: [tags.id],
  }),
}));

export const tasksRelations = relations(tasks, ({
  one, many,
}) => ({
  taskType: one(taskTypes, {
    fields: [tasks.taskTypeId],
    references: [taskTypes.id],
  }),
  tasksToTags: many(tasksToTags),
  bookmarks: many(taskBookmarks),
  todos: many(taskTodos),
}));

export const taskBookmarksRelations = relations(taskBookmarks, ({
  one,
}) => ({
  task: one(tasks, {
    fields: [taskBookmarks.taskId],
    references: [tasks.id],
  }),
}));

export const taskTypesRelations = relations(taskTypes, ({
  many,
}) => ({
  tasks: many(tasks),
}));

export const taskTodosRelations = relations(taskTodos, ({
  one, many,
}) => ({
  task: one(tasks, {
    fields: [taskTodos.taskId],
    references: [tasks.id],
  }),
  bookmarks: many(todoBookmarks),
}));

export const todoBookmarksRelations = relations(todoBookmarks, ({
  one,
}) => ({
  todo: one(taskTodos, {
    fields: [todoBookmarks.todoId],
    references: [taskTodos.id],
  }),
}));

export const routinesRelations = relations(routines, ({
  many,
}) => ({
  connections: many(routineConnections),
}));

export const routineConnectionsRelations = relations(routineConnections, ({
  one,
}) => ({
  routine: one(routines, {
    fields: [routineConnections.routineId],
    references: [routines.id],
  }),
}));
