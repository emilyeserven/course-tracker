import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Domain } from "@emstack/types";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async () => {
      const rawData = await db.query.domains.findMany({
        with: {
          radarBlips: {
            columns: {
              topicId: true,
            },
          },
        },
      });

      const processedData: Partial<Domain>[] = rawData.map(domain => ({
        id: domain.id,
        title: domain.title,
        description: domain.description,
        topicCount: (domain.radarBlips ?? []).length,
      }));

      return processedData;
    },
  );
}
