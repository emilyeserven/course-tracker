import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { topics, topicsToDomains } from "@/db/schema";
import { idParamSchema, nullableString } from "@/utils/schemas";
import { syncJunctionTable } from "@/utils/syncJunctionTable";

const upsertSchema = {
  schema: {
    description: "Update a topic",
    params: idParamSchema,
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
        },
        description: nullableString,
        reason: nullableString,
        domainIds: {
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

      const topicData = {
        id,
        name: body.name,
        description: body.description ?? null,
        reason: body.reason ?? null,
      };

      await db
        .insert(topics)
        .values(topicData)
        .onConflictDoUpdate({
          target: topics.id,
          set: {
            name: topicData.name,
            description: topicData.description,
            reason: topicData.reason,
          },
        });

      if (body.domainIds !== undefined) {
        const uniqueDomainIds = Array.from(new Set(body.domainIds));
        await syncJunctionTable(
          topicsToDomains,
          topicsToDomains.topicId,
          id,
          uniqueDomainIds.map(domainId => ({
            topicId: id,
            domainId,
          })),
        );
      }

      return {
        status: "ok",
      };
    },
  );
}
