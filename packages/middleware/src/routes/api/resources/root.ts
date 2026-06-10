import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { mapResource } from "@/utils/resourceProjection";
import type { Resource } from "@emstack/types";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", async (request, reply) => {
    const rawData = await db.query.resources.findMany({
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

    const processedData: Resource[] = rawData.map(mapResource);

    return processedData;
  });
}
