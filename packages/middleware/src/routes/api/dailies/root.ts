import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { mapDaily } from "@/utils/dailyProjection";
import type { Daily } from "@emstack/types";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", async () => {
    const rawData = await db.query.dailies.findMany({
      with: {
        courseProvider: {
          columns: {
            id: true,
            name: true,
          },
        },
        resource: {
          columns: {
            id: true,
            name: true,
            progressCurrent: true,
            progressTotal: true,
          },
        },
        task: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            resources: {
              columns: {
                id: true,
                usedYet: true,
              },
            },
            todos: {
              columns: {
                id: true,
                isComplete: true,
              },
            },
          },
        },
      },
    });

    const processedData: Daily[] = rawData.map(mapDaily);

    return processedData;
  });
}
