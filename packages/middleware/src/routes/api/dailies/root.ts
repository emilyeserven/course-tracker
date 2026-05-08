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
        course: {
          columns: {
            id: true,
            name: true,
            progressCurrent: true,
            progressTotal: true,
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
      course:
        daily.course?.id && daily.course?.name
          ? {
            id: daily.course.id,
            name: daily.course.name,
            progressCurrent: daily.course.progressCurrent ?? 0,
            progressTotal: daily.course.progressTotal ?? 0,
          }
          : undefined,
    }));

    return processedData;
  });
}
