import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { idParamSchema } from "@/utils/schemas";
import { sendNotFound } from "@/utils/errors";

const getSchema = {
  schema: {
    description: "Get a single module group by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/:id", getSchema, async function (request, reply) {
    const {
      id,
    } = request.params;
    const moduleGroup = await db.query.moduleGroups.findFirst({
      where: (g, {
        eq,
      }) => eq(g.id, id),
      with: {
        modules: {
          orderBy: (m, {
            asc,
          }) => [asc(m.position), asc(m.name)],
        },
      },
    });

    if (!moduleGroup) {
      return sendNotFound(reply, "module group");
    }

    return moduleGroup;
  });
}
