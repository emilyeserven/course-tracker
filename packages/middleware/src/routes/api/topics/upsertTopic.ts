import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { topics } from "@/db/schema";

const upsertSchema = {
  schema: {
    description: "Update a topic",
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
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        description: {
          type: ["string", "null"],
        },
        reason: {
          type: ["string", "null"],
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

      return {
        status: "ok",
      };
    },
  );
}
