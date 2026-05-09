import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { idParamSchema } from "@/utils/schemas";
import { sendNotFound } from "@/utils/errors";

const schema = {
  schema: {
    description: "Get a single task type by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    schema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const taskType = await db.query.taskTypes.findFirst({
        where: (t, {
          eq,
        }) => eq(t.id, id),
      });

      if (!taskType) {
        return sendNotFound(reply, "Task type");
      }

      return taskType;
    },
  );
}
