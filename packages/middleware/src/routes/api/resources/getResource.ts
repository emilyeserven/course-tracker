import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { mapResource } from "@/utils/resourceProjection";
import { idParamSchema } from "@/utils/schemas";

const testSchema = {
  schema: {
    description: "Get a single course by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/:id", testSchema, async function (request, reply) {
    const {
      id,
    } = request.params;
    const course = await db.query.resources.findFirst({
      where: (resources, {
        eq,
      }) => eq(resources.id, id),
      with: {
        courseProvider: {
          with: {
            resources: true,
          },
        },
        topicsToResources: {
          with: {
            topic: {
              columns: {
                name: true,
                id: true,
              },
            },
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

    if (course) {
      return mapResource(course);
    }
  });
}
