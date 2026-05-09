import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { processCost } from "@/utils/processCost";
import { processTopics } from "@/utils/processTopics";
import type { Resource, ResourceFromServer, DailyCompletion } from "@emstack/types";

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
        dailies: {
          columns: {
            id: true,
            name: true,
            completions: true,
          },
        },
      },
    });

    const processedData: Resource[] = rawData.map((course) => {
      const costData = processCost(course as unknown as ResourceFromServer);

      const topics = processTopics(course.topicsToResources);

      return {
        id: course.id,
        name: course.name,
        description: course.description,
        url: course.url,
        cost: costData,
        dateExpires: course.dateExpires,
        progressCurrent: course.progressCurrent ? course.progressCurrent : 0,
        progressTotal: course.progressTotal ? course.progressTotal : 0,
        status: course.status ?? "inactive",
        topics: topics,
        provider:
          course.courseProvider?.name && course.courseProvider?.id
            ? {
              name: course.courseProvider.name,
              id: course.courseProvider.id,
            }
            : undefined,
        dailies: (course.dailies ?? []).map(d => ({
          id: d.id,
          name: d.name,
          completions: (d.completions ?? []) as DailyCompletion[],
        })),
      };
    });

    return processedData;
  });
}
