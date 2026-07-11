import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { sendNotFound } from "@/utils/errors";
import { mapResource } from "@/utils/resourceProjection";
import { idParamSchema } from "@/utils/schemas";

const testSchema = {
  schema: {
    description: "Get a single resource by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/:id", testSchema, async function (request, reply) {
    const {
      id,
    } = request.params;
    const resource = await db.query.resources.findFirst({
      where: (resources, {
        eq,
      }) => eq(resources.id, id),
      with: {
        courseProvider: {
          with: {
            resources: true,
          },
        },
        resourceTags: {
          with: {
            tag: true,
          },
          orderBy: (j, {
            asc,
          }) => asc(j.position),
        },
      },
    });

    if (!resource) {
      return sendNotFound(reply, "Resource");
    }
    return mapResource(resource);
  });
}
