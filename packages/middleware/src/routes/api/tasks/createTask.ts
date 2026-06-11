import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import {
  taskResources,
  taskTodos,
  tasks,
  tasksToResources,
  tasksToTags,
} from "@/db/schema";
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

const createSchema = {
  schema: {
    description: "Create a new task",
    body: {
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
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/",
    createSchema,
    async function (request) {
      const body = request.body;
      const id = uuidv4();

      await db.insert(tasks).values(buildTaskRow(body, id));

      const tagRows = buildTagRows(body.tagIds, id) ?? [];
      if (tagRows.length > 0) {
        await db.insert(tasksToTags).values(tagRows);
      }

      const linkRows = buildResourceLinkRows(body.resourceLinks, id) ?? [];
      if (linkRows.length > 0) {
        await db.insert(tasksToResources).values(linkRows);
      }

      const resourceRows = buildTaskResourceRows(body.resources, id) ?? [];
      if (resourceRows.length > 0) {
        await db.insert(taskResources).values(resourceRows);
      }

      const todoRows = buildTodoRows(body.todos, id) ?? [];
      if (todoRows.length > 0) {
        await db.insert(taskTodos).values(todoRows);
      }

      return {
        status: "ok",
        id,
      };
    },
  );
}
