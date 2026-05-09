import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { topics, topicsToTags } from "@/db/schema";
import { idParamSchema, nullableString, tagIdsArraySchema } from "@/utils/schemas";
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
        tagIds: tagIdsArraySchema,
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

      if (body.tagIds !== undefined) {
        await db.delete(topicsToTags).where(eq(topicsToTags.topicId, id));
        const uniqueTagIds = Array.from(new Set(body.tagIds));
        if (uniqueTagIds.length > 0) {
          await db.insert(topicsToTags).values(
            uniqueTagIds.map((tagId, index) => ({
              topicId: id,
              tagId,
              position: index,
            })),
          );
        }
      }

      return {
        status: "ok",
      };
    },
  );
}
