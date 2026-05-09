import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { taskTypes, tasks } from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";
import { sendConflict } from "@/utils/errors";

const schema = {
  schema: {
    description: "Delete a task type by ID (only if no tasks reference it)",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete("/:id", schema, async function (request, reply) {
    const {
      id,
    } = request.params;

    const [{
      count,
    }] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .where(eq(tasks.taskTypeId, id));

    if (count > 0) {
      return sendConflict(
        reply,
        `Cannot delete task type: ${count} task${count === 1 ? "" : "s"} still reference it`,
      );
    }

    await db.delete(taskTypes).where(eq(taskTypes.id, id));

    return {
      status: "ok",
    };
  });
}
