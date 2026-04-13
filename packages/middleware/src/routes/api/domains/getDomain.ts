import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";

const getDomainSchema = {
  schema: {
    description: "Get a single domain by ID",
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

  fastify.get(
    "/:id",
    getDomainSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const domain = await db.query.domains.findFirst({
        where: (domains, {
          eq,
        }) => (eq(domains.id, id)),
        with: {
          topicsToDomains: {
            with: {
              topic: true,
            },
          },
        },
      });

      if (domain) {
        const topics = domain.topicsToDomains.map((ttd) => {
          if (ttd.topic) {
            return {
              name: ttd.topic.name,
              id: ttd.topic.id,
            };
          }
        }).filter(Boolean);

        return {
          id: domain.id,
          title: domain.title,
          description: domain.description,
          hasRadar: domain.hasRadar,
          topicCount: topics.length,
          topics: topics,
        };
      }
    },
  );
}
