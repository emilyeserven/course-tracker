import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resources, taskTodos, tasks } from "@/db/schema";
import {
  idParamSchema,
  nullableString,
  resourceSchema,
  todoSchema,
} from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const upsertSchema = {
  schema: {
    description: "Update a task and its resources",
    params: idParamSchema,
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        description: nullableString,
        topicId: nullableString,
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

  fastify.put(
    "/:id",
    upsertSchema,
    async function (request) {
      const {
        id,
      } = request.params;
      const body = request.body;

      const taskData = {
        id,
        name: body.name,
        description: body.description ?? null,
        topicId: body.topicId || null,
      };

      await db
        .insert(tasks)
        .values(taskData)
        .onConflictDoUpdate({
          target: tasks.id,
          set: {
            name: taskData.name,
            description: taskData.description,
            topicId: taskData.topicId,
          },
        });

      if (body.resources !== undefined) {
        await db.delete(resources).where(eq(resources.taskId, id));
        if (body.resources.length > 0) {
          await db.insert(resources).values(
            body.resources.map((r, index) => ({
              id: r.id || uuidv4(),
              taskId: id,
              name: r.name,
              url: r.url ?? null,
              easeOfStarting: r.easeOfStarting ?? null,
              timeNeeded: r.timeNeeded ?? null,
              interactivity: r.interactivity ?? null,
              usedYet: r.usedYet ?? false,
              position: index,
            })),
          );
        }
      }

      if (body.todos !== undefined) {
        await db.delete(taskTodos).where(eq(taskTodos.taskId, id));
        if (body.todos.length > 0) {
          await db.insert(taskTodos).values(
            body.todos.map((t, index) => ({
              id: t.id || uuidv4(),
              taskId: id,
              name: t.name,
              isComplete: t.isComplete ?? false,
              url: t.url ?? null,
              position: index,
            })),
          );
        }
      }

      return {
        status: "ok",
      };
    },
  );
}
