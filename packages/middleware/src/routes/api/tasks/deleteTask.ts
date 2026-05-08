import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resources, taskTodos, tasks } from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";

const deleteSchema = {
  schema: {
    description: "Delete a task by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete("/:id", deleteSchema, async function (request) {
    const {
      id,
    } = request.params;

    await db.delete(resources).where(eq(resources.taskId, id));
    await db.delete(taskTodos).where(eq(taskTodos.taskId, id));
    await db.delete(tasks).where(eq(tasks.id, id));

    return {
      status: "ok",
    };
  });
}
