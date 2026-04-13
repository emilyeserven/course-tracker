import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { domains, topicsToDomains } from "@/db/schema";
import { eq } from "drizzle-orm";

const upsertSchema = {
  schema: {
    description: "Create or update a domain",
    params: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
    body: {
      type: "object",
      required: ["title"],
      properties: {
        title: {
          type: "string",
        },
        description: {
          type: ["string", "null"],
        },
        hasRadar: {
          type: ["boolean", "null"],
        },
        topicIds: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/:id",
    upsertSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const body = request.body;

      const domainData = {
        id,
        title: body.title,
        description: body.description ?? null,
        hasRadar: body.hasRadar ?? null,
      };

      await db
        .insert(domains)
        .values(domainData)
        .onConflictDoUpdate({
          target: domains.id,
          set: {
            title: domainData.title,
            description: domainData.description,
            hasRadar: domainData.hasRadar,
          },
        });

      await db.delete(topicsToDomains).where(eq(topicsToDomains.domainId, id));

      if (body.topicIds && body.topicIds.length > 0) {
        await db.insert(topicsToDomains).values(
          body.topicIds.map(topicId => ({
            topicId,
            domainId: id,
          })),
        );
      }

      return {
        status: "ok",
      };
    },
  );
}
