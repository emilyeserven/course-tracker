import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { TopicForTopicsPage } from "@emstack/types";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async () => {
      const rawData = await db.query.topics.findMany({
        with: {
          topicsToResources: {
            with: {
              resource: {
                columns: {
                  name: true,
                },
              },
            },
          },
          radarBlips: {
            with: {
              domain: {
                columns: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          tasks: {
            with: {
              daily: {
                columns: {
                  id: true,
                },
              },
            },
          },
        },
      });

      const processedData: TopicForTopicsPage[] = rawData.map((topic) => {
        const resourceCount = topic.topicsToResources?.length ?? 0;
        const taskCount = topic.tasks?.length ?? 0;
        const dailyCount
          = topic.tasks?.filter(t => t.daily != null).length ?? 0;

        const domainsById = new Map<string, { id: string;
          title: string; }>();
        for (const blip of topic.radarBlips ?? []) {
          if (blip.domain?.id && blip.domain.title && !domainsById.has(blip.domain.id)) {
            domainsById.set(blip.domain.id, {
              id: blip.domain.id,
              title: blip.domain.title,
            });
          }
        }

        return {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          reason: topic.reason,
          resourceCount: resourceCount,
          taskCount: taskCount,
          dailyCount: dailyCount,
          domains: Array.from(domainsById.values()),
        };
      });

      return processedData;
    },
  );
}
