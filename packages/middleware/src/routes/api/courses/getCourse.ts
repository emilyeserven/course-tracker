import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { processCost } from "@/utils/processCost";
import { processTopics } from "@/utils/processTopics";
import type { Course, CourseFromServer } from "@emstack/types/src";

const testSchema = {
  schema: {
    description: "It's like looking into a mirror...",
    params: {
      type: "object",
      properties: {
        id: {
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
    "/:id",
    testSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const course: CourseFromServer | undefined = await db.query.courses.findFirst({
        where: (courses, {
          eq,
        }) => (eq(courses.id, id)),
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
        },
      });

      if (course) {
        const costData = processCost(course);

        const topics = processTopics(course.topicsToCourses);

        const rawData: Course = {
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
