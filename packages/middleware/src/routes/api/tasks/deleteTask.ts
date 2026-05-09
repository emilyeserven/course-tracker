import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  resources,
  resourcesToTags,
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

    const taskResources = await db
      .select({
        id: resources.id,
      })
      .from(resources)
      .where(eq(resources.taskId, id));

    if (taskResources.length > 0) {
      await db
        .delete(resourcesToTags)
        .where(
          inArray(
            resourcesToTags.resourceId,
            taskResources.map(r => r.id),
          ),
        );
    }

    await db.delete(tasksToTags).where(eq(tasksToTags.taskId, id));
    await db.delete(tasksToCourses).where(eq(tasksToCourses.taskId, id));
    await db.delete(resources).where(eq(resources.taskId, id));
    await db.delete(taskTodos).where(eq(taskTodos.taskId, id));
    await db.delete(tasks).where(eq(tasks.id, id));

    return {
      status: "ok",
    };
  });
}
