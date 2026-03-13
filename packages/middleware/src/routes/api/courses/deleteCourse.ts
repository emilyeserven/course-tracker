import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { courses, topicsToCourses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const deleteCourseSchema = {
  schema: {
    description: "It's like looking into a mirror...",
    params: z.object({
      id: z.string(),
    }),
  },
};

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<ZodTypeProvider>();

  fastify.delete(
    "/:id",
    deleteCourseSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      await db.delete(topicsToCourses).where(eq(topicsToCourses.courseId, id));
      await db.delete(courses).where(eq(courses.id, id));

      return {
        status: "ok",
      };
    },
  );
}
