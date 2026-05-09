import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { processCost } from "@/utils/processCost";
import { processTopics } from "@/utils/processTopics";
import type { Course, CourseFromServer, DailyCompletion } from "@emstack/types/src";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", async (request, reply) => {
    const rawData = await db.query.courses.findMany({
      with: {
        courseProvider: {
          with: {
            courses: true,
          },
        },
        topicsToCourses: {
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

    const processedData: Course[] = rawData.map((course) => {
      const costData = processCost(course as unknown as CourseFromServer);

      const topics = processTopics(course.topicsToCourses);

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
