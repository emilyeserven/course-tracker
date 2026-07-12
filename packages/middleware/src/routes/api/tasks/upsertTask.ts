import { taskBookmarks, taskTodos, tasks, tasksToTags } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";

import {
  buildBookmarkRows,
  buildTagRows,
  buildTaskRow,
  buildTodoRows,
  taskBodySchema,
} from "./taskRows";
import { syncTodoBookmarks } from "./syncTodoBookmarks";

import type { TaskBody } from "./taskRows";

export default createUpsertHandler<TaskBody>({
  description: "Update a task and its todos/bookmarks",
  table: tasks,
  bodySchema: taskBodySchema,
  buildRow: buildTaskRow,
  updateableColumns: ["name", "description", "dueDate", "taskTypeId"],
  junctions: [
    {
      table: tasksToTags,
      foreignKey: tasksToTags.taskId,
      buildRows: (body, id) => buildTagRows(body.tagIds, id),
    },
    {
      table: taskBookmarks,
      foreignKey: taskBookmarks.taskId,
      buildRows: (body, id) => buildBookmarkRows(body.bookmarks, id),
    },
    {
      table: taskTodos,
      foreignKey: taskTodos.taskId,
      buildRows: (body, id) => buildTodoRows(body.todos, id),
    },
  ],
  // task_todos are rebuilt above (delete + reinsert), cascade-clearing their
  // todo_bookmarks; re-sync them from the todo payload once the rows exist.
  afterUpsert: body => syncTodoBookmarks(body.todos),
});
