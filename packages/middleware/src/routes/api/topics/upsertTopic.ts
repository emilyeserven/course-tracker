import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { topics } from "@/db/schema";
import { idParamSchema, nullableString } from "@/utils/schemas";
import { syncDomainMembershipByTopic } from "@/utils/syncMembershipBlips";

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
    async function (request) {
      const {
        id,
      } = request.params;
      const body = request.body;

      const row = {
        id,
        name: body.name,
        description: body.description ?? null,
        reason: body.reason ?? null,
      };

      await db
        .insert(topics)
        .values(row)
        .onConflictDoUpdate({
          target: topics.id,
          set: {
            name: row.name,
            description: row.description,
            reason: row.reason,
          },
        });

      if (body.domainIds !== undefined) {
        await syncDomainMembershipByTopic(
          id,
          Array.from(new Set(body.domainIds)),
        );
      }

      return {
        status: "ok",
      };
    },
  );
}
