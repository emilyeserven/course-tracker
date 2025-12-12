import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { courses, topicsToCourses } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  fastify.delete(
    "/:id",
    testSchema,
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
