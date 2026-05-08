import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Domain } from "@emstack/types/src";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async (request, reply) => {
      const rawData = await db.query.domains.findMany({
        with: {
          topicsToDomains: {
            columns: {
              topicId: true,
            },
          },
          radarBlips: {
            columns: {
              topicId: true,
            },
          },
        },
      });

      const processedData: Partial<Domain>[] = rawData.map((domain) => {
        const topicIds = new Set<string>();
        for (const ttd of domain.topicsToDomains ?? []) {
          topicIds.add(ttd.topicId);
        }
        for (const blip of domain.radarBlips ?? []) {
          topicIds.add(blip.topicId);
        }

        return {
          id: domain.id,
          title: domain.title,
          description: domain.description,
          hasRadar: domain.hasRadar,
          topicCount: topicIds.size,
        };
      });

      return processedData;
    },
  );
}
