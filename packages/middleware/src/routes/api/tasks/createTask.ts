import { taskBookmarks, taskTodos, tasks, tasksToTags } from "@/db/schema";
import { createCreateHandler } from "@/utils/createCreateHandler";

import {
  buildBookmarkRows,
  buildTagRows,
  buildTaskRow,
  buildTodoRows,
  taskBodySchema,
} from "./taskRows";
import { syncTodoBookmarks } from "./syncTodoBookmarks";

import type { TaskBody } from "./taskRows";

export default createCreateHandler<TaskBody>({
  description: "Create a new task",
  table: tasks,
  bodySchema: taskBodySchema,
  buildRow: buildTaskRow,
  junctions: [
    {
      table: tasksToTags,
      buildRows: (body, id) => buildTagRows(body.tagIds, id),
    },
    {
      table: taskBookmarks,
      buildRows: (body, id) => buildBookmarkRows(body.bookmarks, id),
    },
    {
      table: taskTodos,
      buildRows: (body, id) => buildTodoRows(body.todos, id),
    },
  ],
  // task_todos are inserted above; their bookmarks are a nested junction synced
  // from the todo payload once the todo rows exist.
  afterCreate: body => syncTodoBookmarks(body.todos),
});
