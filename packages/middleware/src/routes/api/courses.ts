import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/courses",
    async (request, reply) => {
      const result = await db.query.courses.findMany({
        with: {
          courseProvider: true,
          topicsToCourses: true,
        },
      });

      return result;
    },
  );
}
