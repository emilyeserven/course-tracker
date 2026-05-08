import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Radar } from "@emstack/types/src";

const getRadarSchema = {
  schema: {
    description: "Get the radar (quadrants, rings, blips) for a domain",
    params: {
      type: "object",
      properties: {
        domainId: {
          type: "string",
        },
      },
      required: ["domainId"],
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:domainId/radar",
    getRadarSchema,
    async function (request, reply) {
      const {
        domainId,
      } = request.params;

      const domain = await db.query.domains.findFirst({
        where: (domains, {
          eq,
        }) => eq(domains.id, domainId),
        with: {
          radarQuadrants: true,
          radarRings: true,
          radarBlips: {
            with: {
              topic: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!domain) {
        reply.status(404);
        return {
          error: "Domain not found",
        };
      }

      const radar: Radar = {
        domainId: domain.id,
        domainTitle: domain.title,
        quadrants: [...(domain.radarQuadrants ?? [])].sort(
          (a, b) => a.position - b.position,
        ),
        rings: [...(domain.radarRings ?? [])].sort(
          (a, b) => a.position - b.position,
        ),
        blips: (domain.radarBlips ?? []).map(b => ({
          id: b.id,
          domainId: b.domainId,
          quadrantId: b.quadrantId,
          ringId: b.ringId,
          topicId: b.topicId,
          topicName: b.topic?.name ?? "",
          description: b.description,
        })),
      };

      return radar;
    },
  );
}
