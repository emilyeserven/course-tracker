import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { radarBlips } from "@/db/schema";
import { nullableBoolean, nullableString } from "@/utils/schemas";

const upsertBlipSchema = {
  schema: {
    description: "Create or update a blip on a domain's radar",
    params: {
      type: "object",
      properties: {
        domainId: {
          type: "string",
        },
        blipId: {
          type: "string",
        },
      },
      required: ["domainId", "blipId"],
    },
    body: {
      type: "object",
      required: ["topicId"],
      properties: {
        topicId: {
          type: "string",
        },
        description: nullableString,
        quadrantId: nullableString,
        ringId: nullableString,
        isIgnored: nullableBoolean,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/:domainId/radar/blips/:blipId",
    upsertBlipSchema,
    async function (request) {
      const {
        domainId, blipId,
      } = request.params;
      const body = request.body;

      await db
        .insert(radarBlips)
        .values({
          id: blipId,
          domainId,
          quadrantId: body.quadrantId ?? null,
          ringId: body.ringId ?? null,
          topicId: body.topicId,
          description: body.description ?? null,
          isIgnored: body.isIgnored ?? false,
        })
        .onConflictDoUpdate({
          target: radarBlips.id,
          set: {
            quadrantId: body.quadrantId ?? null,
            ringId: body.ringId ?? null,
            topicId: body.topicId,
            description: body.description ?? null,
            isIgnored: body.isIgnored ?? false,
          },
        });

      return {
        status: "ok",
      };
    },
  );
}
