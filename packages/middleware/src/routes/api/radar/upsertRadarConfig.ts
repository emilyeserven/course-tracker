import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { radarBlips, radarQuadrants, radarRings } from "@/db/schema";

const upsertConfigSchema = {
  schema: {
    description:
      "Replace the radar configuration (quadrants and rings) for a domain. Blips referencing removed quadrants/rings are deleted.",
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
          maxItems: 4,
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
          maxItems: 4,
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
    async function (request) {
      const {
        domainId,
      } = request.params;
      const {
        quadrants, rings,
      } = request.body;

      const incomingQuadrantIds = quadrants
        .map(q => q.id)
        .filter((id): id is string => Boolean(id));
      const incomingRingIds = rings
        .map(r => r.id)
        .filter((id): id is string => Boolean(id));

      const existingQuadrants = await db.query.radarQuadrants.findMany({
        where: (q, {
          eq,
        }) => eq(q.domainId, domainId),
      });
      const existingRings = await db.query.radarRings.findMany({
        where: (r, {
          eq,
        }) => eq(r.domainId, domainId),
      });

      const removedQuadrantIds = existingQuadrants
        .map(q => q.id)
        .filter(id => !incomingQuadrantIds.includes(id));
      const removedRingIds = existingRings
        .map(r => r.id)
        .filter(id => !incomingRingIds.includes(id));

      if (removedQuadrantIds.length > 0) {
        await db
          .delete(radarBlips)
          .where(inArray(radarBlips.quadrantId, removedQuadrantIds));
        await db
          .delete(radarQuadrants)
          .where(inArray(radarQuadrants.id, removedQuadrantIds));
      }
      if (removedRingIds.length > 0) {
        await db
          .delete(radarBlips)
          .where(inArray(radarBlips.ringId, removedRingIds));
        await db
          .delete(radarRings)
          .where(inArray(radarRings.id, removedRingIds));
      }

      for (const q of quadrants) {
        const id = q.id ?? uuidv4();
        await db
          .insert(radarQuadrants)
          .values({
            id,
            domainId,
            name: q.name,
            position: q.position,
          })
          .onConflictDoUpdate({
            target: radarQuadrants.id,
            set: {
              name: q.name,
              position: q.position,
            },
          });
      }

      for (const r of rings) {
        const id = r.id ?? uuidv4();
        await db
          .insert(radarRings)
          .values({
            id,
            domainId,
            name: r.name,
            position: r.position,
          })
          .onConflictDoUpdate({
            target: radarRings.id,
            set: {
              name: r.name,
              position: r.position,
            },
          });
      }

      return {
        status: "ok",
      };
    },
  );
}
