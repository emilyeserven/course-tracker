import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Daily, DailyCompletion } from "@emstack/types/src";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", async (request, reply) => {
    const rawData = await db.query.dailies.findMany({
      with: {
        courseProvider: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    const processedData: Daily[] = rawData.map(daily => ({
      id: daily.id,
      name: daily.name,
      location: daily.location,
      description: daily.description,
      completions: (daily.completions ?? []) as DailyCompletion[],
      provider:
        daily.courseProvider?.name && daily.courseProvider?.id
          ? {
            name: daily.courseProvider.name,
            id: daily.courseProvider.id,
          }
          : undefined,
    }));

    return processedData;
  });
}
