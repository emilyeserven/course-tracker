import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  taskResources,
  taskTodos,
  tasks,
  tasksToResources,
  tasksToTags,
} from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";

const schema = {
  schema: {
    description: "Delete a task by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete("/:id", schema, async function (request) {
    const {
      id,
    } = request.params;

    await db.delete(tasksToTags).where(eq(tasksToTags.taskId, id));
    await db.delete(tasksToResources).where(eq(tasksToResources.taskId, id));
    await db.delete(taskResources).where(eq(taskResources.taskId, id));
    await db.delete(taskTodos).where(eq(taskTodos.taskId, id));
    await db.delete(tasks).where(eq(tasks.id, id));

    return {
      status: "ok",
    };
  });
}
