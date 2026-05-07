import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { domains, topicsToDomains } from "@/db/schema";
import { idParamSchema, nullableBoolean, nullableString } from "@/utils/schemas";
import { syncJunctionTable } from "@/utils/syncJunctionTable";

const upsertSchema = {
  schema: {
    description: "Create or update a domain",
    params: idParamSchema,
    body: {
      type: "object",
      required: ["title"],
      properties: {
        title: {
          type: "string",
        },
        description: nullableString,
        hasRadar: nullableBoolean,
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

      await syncJunctionTable(
        topicsToDomains,
        topicsToDomains.domainId,
        id,
        (body.topicIds ?? []).map(topicId => ({
          topicId,
          domainId: id,
        })),
      );

      return {
        status: "ok",
      };
    },
  );
}
