import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { TopicsFromServer } from "@emstack/types/src/TopicsFromServer";
import { processCourses } from "@/utils/processCourses";
import { z } from "zod";

const getTopicSchema = {
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
    getTopicSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const topic: TopicsFromServer | undefined = await db.query.topics.findFirst({
        where: (courses, {
          eq,
        }) => (eq(courses.id, id)),
        with: {
          topicsToCourses: {
            with: {
              course: {
                columns: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      if (topic) {
        const courseCount = topic.topicsToCourses?.length ?? 0;
        const courses = processCourses(topic.topicsToCourses);

        return {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          reason: topic.reason,
          courseCount: courseCount,
          courses: courses,
        };
      }
    },
  );
}
