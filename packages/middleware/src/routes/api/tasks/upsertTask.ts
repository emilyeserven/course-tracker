import { taskResources, taskTodos, tasks, tasksToResources, tasksToTags } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import {
  nullableString,
  resourceLinksArraySchema,
  resourceSchema,
  tagIdsArraySchema,
  todoSchema,
} from "@/utils/schemas";

import {
  buildResourceLinkRows,
  buildTagRows,
  buildTaskResourceRows,
  buildTaskRow,
  buildTodoRows,
} from "./taskRows";

import type {
  ResourceLinkInput,
  TaskBodyFields,
  TaskResourceInput,
  TodoInput,
} from "./taskRows";

interface TaskBody extends TaskBodyFields {
  tagIds?: string[];
  resourceLinks?: ResourceLinkInput[];
  resources?: TaskResourceInput[];
  todos?: TodoInput[];
}

export default createUpsertHandler<TaskBody>({
  description: "Update a task and its resources",
  table: tasks,
  bodySchema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
      },
      description: nullableString,
      topicId: nullableString,
      taskTypeId: nullableString,
      tagIds: tagIdsArraySchema,
      resourceLinks: resourceLinksArraySchema,
      resources: {
        type: "array",
        items: resourceSchema,
      },
      todos: {
        type: "array",
        items: todoSchema,
      },
    },
  },
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
