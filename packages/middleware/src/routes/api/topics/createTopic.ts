import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { topics, topicsToTags } from "@/db/schema";
import { nullableString, tagIdsArraySchema } from "@/utils/schemas";
import { syncDomainMembershipByTopic } from "@/utils/syncMembershipBlips";
import { v4 as uuidv4 } from "uuid";

const createSchema = {
  schema: {
    description: "Create a new topic",
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

  fastify.post(
    "/",
    createSchema,
    async function (request) {
      const body = request.body;
      const id = uuidv4();

      await db.insert(topics).values({
        id,
        name: body.name,
        description: body.description ?? null,
        reason: body.reason ?? null,
      });

      const uniqueDomainIds = Array.from(new Set(body.domainIds ?? []));
      if (uniqueDomainIds.length > 0) {
        await syncDomainMembershipByTopic(id, uniqueDomainIds);
      }

      const uniqueTagIds = Array.from(new Set(body.tagIds ?? []));
      if (uniqueTagIds.length > 0) {
        await db.insert(topicsToTags).values(
          uniqueTagIds.map((tagId, index) => ({
            topicId: id,
            tagId,
            position: index,
          })),
        );
      }

      return {
        status: "ok",
        id,
      };
    },
  );
}
