import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { processCost } from "@/utils/processCost";
import { processTopics } from "@/utils/processTopics";
import type { Course, CourseFromServer } from "@emstack/types/src";
import { z } from "zod";

const getCourseSchema = {
  schema: {
    description: "It's like looking into a mirror...",
    params: z.object({
      id: z.string(),
    }),
  },
};

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<ZodTypeProvider>();

  fastify.get(
    "/:id",
    getCourseSchema,
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
          provider: course.courseProvider
            ? {
              name: course.courseProvider.name,
              id: course.courseProvider.id,
            }
            : undefined,
        };

        return rawData;
      }
    },
  );
}
