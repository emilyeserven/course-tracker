import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { domains, radarBlips } from "@/db/schema";
import type { RadarConfig } from "@/db/schema";
import { sendNotFound } from "@/utils/errors";

const upsertConfigSchema = {
  schema: {
    description:
      "Replace the radar configuration (quadrants and rings) for a domain. Blips referencing removed quadrants/rings have their reference cleared.",
    params: {
      type: "object",
      properties: {
        domainId: {
          type: "string",
        },
      },
      required: ["domainId"],
    },
    body: {
      type: "object",
      required: ["quadrants", "rings"],
      properties: {
        quadrants: {
          type: "array",
          maxItems: 5,
          items: {
            type: "object",
            required: ["name", "position"],
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
              position: {
                type: "integer",
              },
            },
          },
        },
        rings: {
          type: "array",
          maxItems: 6,
          items: {
            type: "object",
            required: ["name", "position"],
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
              position: {
                type: "integer",
              },
            },
          },
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/:domainId/radar",
    upsertConfigSchema,
    async function (request, reply) {
      const {
        domainId,
      } = request.params;
      const {
        quadrants, rings,
      } = request.body;

      const domain = await db.query.domains.findFirst({
        where: (d, {
          eq: e,
        }) => e(d.id, domainId),
        columns: {
          id: true,
          radarConfig: true,
        },
      });
      if (!domain) {
        return sendNotFound(reply, "Domain");
      }

      const newConfig: RadarConfig = {
        quadrants: quadrants.map((q, idx) => ({
          id: q.id ?? uuidv4(),
          name: q.name,
          position: q.position ?? idx,
        })),
        rings: rings.map((r, idx) => ({
          id: r.id ?? uuidv4(),
          name: r.name,
          position: r.position ?? idx,
        })),
      };

      await db
        .update(domains)
        .set({
          radarConfig: newConfig,
        })
        .where(eq(domains.id, domainId));

      const keptQuadrantIds = new Set(newConfig.quadrants.map(q => q.id));
      const keptRingIds = new Set(newConfig.rings.map(r => r.id));

      const blips = await db.query.radarBlips.findMany({
        where: (b, {
          eq: e,
        }) => e(b.domainId, domainId),
        columns: {
          id: true,
          quadrantId: true,
          ringId: true,
        },
      });
      for (const blip of blips) {
        const quadOk = blip.quadrantId == null || keptQuadrantIds.has(blip.quadrantId);
        const ringOk = blip.ringId == null || keptRingIds.has(blip.ringId);
        if (quadOk && ringOk) {
          continue;
        }
        await db
          .update(radarBlips)
          .set({
            quadrantId: quadOk ? blip.quadrantId : null,
            ringId: ringOk ? blip.ringId : null,
          })
          .where(eq(radarBlips.id, blip.id));
      }

      return {
        status: "ok",
      };
    },
  );
}
