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
        },
      });

      const processedData: Partial<Domain>[] = rawData.map((domain) => {
        const topicCount = domain.topicsToDomains?.length ?? 0;

        return {
          id: domain.id,
          title: domain.title,
          description: domain.description,
          hasRadar: domain.hasRadar,
          topicCount: topicCount,
        };
      });

      return processedData;
    },
  );
}
