import { taskBookmarks, taskResources, taskTodos, tasks, tasksToResources, tasksToTags } from "@/db/schema";
import { createCreateHandler } from "@/utils/createCreateHandler";

import {
  buildBookmarkRows,
  buildResourceLinkRows,
  buildTagRows,
  buildTaskResourceRows,
  buildTaskRow,
  buildTodoRows,
  taskBodySchema,
} from "./taskRows";

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
      table: tasksToResources,
      buildRows: (body, id) => buildResourceLinkRows(body.resourceLinks, id),
    },
    {
      table: taskBookmarks,
      buildRows: (body, id) => buildBookmarkRows(body.bookmarks, id),
    },
    {
      table: taskResources,
      buildRows: (body, id) => buildTaskResourceRows(body.resources, id),
    },
    {
      table: taskTodos,
      buildRows: (body, id) => buildTodoRows(body.todos, id),
    },
  ],
});
