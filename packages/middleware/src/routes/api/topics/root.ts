import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Topic } from "@emstack/types/src";
import { TopicsFromServer } from "@emstack/types/src/TopicsFromServer";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async (request, reply) => {
      const rawData = await db.query.topics.findMany({
        with: {
          topicsToCourses: {
            with: {
              course: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const processedData: Topic[] = rawData.map((topic: TopicsFromServer) => {
        const courseCount = topic.topicsToCourses?.length ?? 0;
        console.log("cC", courseCount);

        return {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          reason: topic.reason,
          courseCount: courseCount,
        };
      });

      return processedData;
    },
  );
}
