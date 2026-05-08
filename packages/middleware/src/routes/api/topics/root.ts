import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { TopicForTopicsPage } from "@emstack/types/src";
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
          topicsToDomains: {
            with: {
              domain: {
                columns: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      const processedData: TopicForTopicsPage[] = rawData.map((topic: TopicsFromServer) => {
        const courseCount = topic.topicsToCourses?.length ?? 0;

        const domainsById = new Map<string, { id: string;
          title: string; }>();
        for (const ttd of topic.topicsToDomains ?? []) {
          if (ttd.domain?.id && ttd.domain.title && !domainsById.has(ttd.domain.id)) {
            domainsById.set(ttd.domain.id, {
              id: ttd.domain.id,
              title: ttd.domain.title,
            });
          }
        }

        return {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          reason: topic.reason,
          courseCount: courseCount,
          domains: Array.from(domainsById.values()),
        };
      });

      return processedData;
    },
  );
}
