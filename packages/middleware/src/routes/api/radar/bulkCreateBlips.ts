import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { radarBlips, topics } from "@/db/schema";
import { nullableString } from "@/utils/schemas";

const bulkCreateBlipsSchema = {
  schema: {
    description:
      "Create multiple blips at once. Each entry references either an existing"
      + " topic by id, or supplies a new topic name to create on the fly.",
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
      required: ["blips"],
      properties: {
        blips: {
          type: "array",
          items: {
            type: "object",
            required: ["quadrantId", "ringId"],
            properties: {
              topicId: nullableString,
              newTopicName: nullableString,
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
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:domainId/radar/blips/bulk",
    bulkCreateBlipsSchema,
    async function (request, reply) {
      const {
        domainId,
      } = request.params;
      const {
        blips,
      } = request.body;

      const createdIds: string[] = [];
      for (const entry of blips) {
        let topicId = entry.topicId ?? null;
        if (!topicId && entry.newTopicName) {
          const trimmed = entry.newTopicName.trim();
          if (!trimmed) {
            continue;
          }
          const existing = await db.query.topics.findFirst({
            where: (t, {
              sql,
            }) => sql`LOWER(${t.name}) = LOWER(${trimmed})`,
          });
          if (existing) {
            topicId = existing.id;
          }
          else {
            const newId = uuidv4();
            await db.insert(topics).values({
              id: newId,
              name: trimmed,
            }).onConflictDoNothing();
            const refetched = await db.query.topics.findFirst({
              where: (t, {
                eq,
              }) => eq(t.name, trimmed),
            });
            topicId = refetched?.id ?? newId;
          }
        }
        if (!topicId) {
          reply.status(400);
          return {
            error: "Each blip must have either topicId or newTopicName.",
          };
        }
        const blipId = uuidv4();
        await db.insert(radarBlips).values({
          id: blipId,
          domainId,
          quadrantId: entry.quadrantId,
          ringId: entry.ringId,
          topicId,
          description: entry.description ?? null,
          comment: entry.comment ?? null,
        });
        createdIds.push(blipId);
      }

      return {
        status: "ok",
        count: createdIds.length,
        ids: createdIds,
      };
    },
  );
}
