import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { idParamSchema } from "@/utils/schemas";
import { sendNotFound } from "@/utils/errors";

const getSchema = {
  schema: {
    description: "Get a single tag group by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/:id", getSchema, async function (request, reply) {
    const { id } = request.params;
    const tagGroup = await db.query.tagGroups.findFirst({
      where: (g, { eq }) => eq(g.id, id),
      with: {
        tags: {
          orderBy: (t, { asc }) => [asc(t.position), asc(t.name)],
        },
      },
    });

    if (!tagGroup) {
      return sendNotFound(reply, "tag group");
    }

    return tagGroup;
  });
}
