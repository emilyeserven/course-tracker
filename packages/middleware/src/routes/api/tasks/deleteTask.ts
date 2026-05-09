import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  taskResources,
  taskResourcesToTags,
  taskTodos,
  tasks,
  tasksToCourses,
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

    const existingTaskResources = await db
      .select({
        id: taskResources.id,
      })
      .from(taskResources)
      .where(eq(taskResources.taskId, id));

    if (existingTaskResources.length > 0) {
      await db
        .delete(taskResourcesToTags)
        .where(
          inArray(
            taskResourcesToTags.resourceId,
            existingTaskResources.map(r => r.id),
          ),
        );
    }

    await db.delete(tasksToTags).where(eq(tasksToTags.taskId, id));
    await db.delete(tasksToCourses).where(eq(tasksToCourses.taskId, id));
    await db.delete(taskResources).where(eq(taskResources.taskId, id));
    await db.delete(taskTodos).where(eq(taskTodos.taskId, id));
    await db.delete(tasks).where(eq(tasks.id, id));

    return {
      status: "ok",
    };
  });
}
