import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async (request, reply) => {
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
                },
              },
            },
          },
        },
      });

      const processedData = rawData.map((course) => {
        let costData = {};
        if (course.isCostFromPlatform === true && course.courseProvider) {
          costData = {
            cost: course.courseProvider.cost,
            isCostFromPlatform: course.isCostFromPlatform,
            splitBy: course.courseProvider.courses.length,
          };
        }
        else {
          costData = {
            cost: course.cost,
            isCostFromPlatform: course.isCostFromPlatform,
          };
        }

        const topics = course.topicsToCourses.map((topicToCourse) => {
          return topicToCourse.topic.name;
        });

        return {
          id: course.id,
          name: course.name,
          description: course.description,
          url: course.url,
          cost: costData,
          dateExpires: course.dateExpires,
          progressCurrent: course.progressCurrent ? course.progressCurrent : 0,
          progressTotal: course.progressTotal ? course.progressTotal : 0,
          status: course.status,
          topics: topics,
          provider: course.courseProvider ? course.courseProvider.name : "",
        };
      });

      return processedData;
    },
  );
}
