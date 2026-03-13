import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { topics, topicsToCourses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const deleteTopicSchema = {
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
    deleteTopicSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      await db.delete(topicsToCourses).where(eq(topicsToCourses.topicId, id));
      await db.delete(topics).where(eq(topics.id, id));

      return {
        status: "ok",
      };
    },
  );
}
