import { taskResources, taskTodos, tasks, tasksToResources, tasksToTags } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";

import {
  buildResourceLinkRows,
  buildTagRows,
  buildTaskResourceRows,
  buildTaskRow,
  buildTodoRows,
  taskBodySchema,
} from "./taskRows";

import type { TaskBody } from "./taskRows";

export default createUpsertHandler<TaskBody>({
  description: "Update a task and its resources",
  table: tasks,
  bodySchema: taskBodySchema,
  buildRow: buildTaskRow,
  updateableColumns: ["name", "description", "topicId", "taskTypeId"],
  junctions: [
    {
      table: tasksToTags,
      foreignKey: tasksToTags.taskId,
      buildRows: (body, id) => buildTagRows(body.tagIds, id),
    },
    {
      table: tasksToResources,
      foreignKey: tasksToResources.taskId,
      buildRows: (body, id) => buildResourceLinkRows(body.resourceLinks, id),
    },
    {
      table: taskResources,
      foreignKey: taskResources.taskId,
      buildRows: (body, id) => buildTaskResourceRows(body.resources, id),
    },
    {
      table: taskTodos,
      foreignKey: taskTodos.taskId,
      buildRows: (body, id) => buildTodoRows(body.todos, id),
    },
  ],
});
