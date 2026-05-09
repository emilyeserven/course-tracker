import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { idParamSchema } from "@/utils/schemas";
import { sendNotFound } from "@/utils/errors";

const getSchema = {
  schema: {
    description: "Get a single tag by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/:id", getSchema, async function (request, reply) {
    const {
      id,
    } = request.params;
    const tag = await db.query.tags.findFirst({
      where: (t, {
        eq,
      }) => eq(t.id, id),
    });

    if (!tag) {
      return sendNotFound(reply, "tag");
    }

    return tag;
  });
}
