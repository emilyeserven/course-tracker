import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";

const testSchema = {
  schema: {
    description: "It's like looking into a mirror...",
    params: {
      type: "object",
      properties: {
        test: {
          type: "string",
        },
      },
      required: ["id"],
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/course/:id",
    testSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const course = await db.query.courses.findFirst({
        where: (courses, {
          eq,
        }) => (eq(courses.id, Number(id))),
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

      if (course) {
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

        const rawData = {
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

        return rawData;
      }
    },
  );
}
