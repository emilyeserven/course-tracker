import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { idParamSchema } from "@/utils/schemas";
import { sendNotFound } from "@/utils/errors";

const schema = {
  schema: {
    description: "Get a single daily criteria template by ID",
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
      const template = await db.query.dailyCriteriaTemplates.findFirst({
        where: (t, {
          eq,
        }) => eq(t.id, id),
      });

      if (!template) {
        return sendNotFound(reply, "Daily criteria template");
      }

      return template;
    },
  );
}
