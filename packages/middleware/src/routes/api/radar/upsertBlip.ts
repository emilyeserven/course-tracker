import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { radarBlips } from "@/db/schema";
import { nullableString } from "@/utils/schemas";

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
      required: ["topicId", "quadrantId", "ringId"],
      properties: {
        topicId: {
          type: "string",
        },
        description: nullableString,
        comment: nullableString,
        quadrantId: {
          type: "string",
        },
        ringId: {
          type: "string",
        },
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

      const updateSet: Record<string, unknown> = {
        quadrantId: body.quadrantId,
        ringId: body.ringId,
        topicId: body.topicId,
        description: body.description ?? null,
      };
      // Only touch comment when the caller explicitly supplied one; otherwise
      // preserve whatever is already saved so unrelated edits don't wipe it.
      if (body.comment !== undefined) {
        updateSet.comment = body.comment;
      }

      await db
        .insert(radarBlips)
        .values({
          id: blipId,
          domainId,
          quadrantId: body.quadrantId,
          ringId: body.ringId,
          topicId: body.topicId,
          description: body.description ?? null,
          comment: body.comment ?? null,
        })
        .onConflictDoUpdate({
          target: radarBlips.id,
          set: updateSet,
        });

      return {
        status: "ok",
      };
    },
  );
}
