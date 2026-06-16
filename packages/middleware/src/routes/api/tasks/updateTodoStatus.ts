import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { taskTodos } from "@/db/schema";
import { sendNotFound } from "@/utils/errors";

const bodySchema = {
  type: "object",
  required: ["status"],
  properties: {
    status: {
      type: "string",
      enum: ["incomplete", "touched", "goal", "exceeded", "freeze"],
    },
  },
} as const;

const paramsSchema = {
  type: "object",
  required: ["id", "todoId"],
  properties: {
    id: {
      type: "string",
    },
    todoId: {
      type: "string",
    },
  },
} as const;

// Surgical single-todo status update, used by the Do Now tracker so a status
// change on a todo row writes back to that todo (not a routine) without a full
// task upsert.
export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/:id/todos/:todoId/status",
    {
      schema: {
        description: "Update a single Task List todo's status.",
        params: paramsSchema,
        body: bodySchema,
      },
    },
    async function (request, reply) {
      const {
        id, todoId,
      } = request.params;
      const {
        status,
      } = request.body;

      const updated = await db
        .update(taskTodos)
        .set({
          status,
        })
        .where(and(eq(taskTodos.id, todoId), eq(taskTodos.taskId, id)))
        .returning({
          id: taskTodos.id,
        });

      if (updated.length === 0) {
        return sendNotFound(reply, "Todo");
      }

      return {
        id: todoId,
        status,
      };
    },
  );
}
