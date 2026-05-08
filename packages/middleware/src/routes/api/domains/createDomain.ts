import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { domainExcludedTopics, domains, topicsToDomains } from "@/db/schema";
import { nullableBoolean, nullableString } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const createSchema = {
  schema: {
    description: "Create a new domain",
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
        excludedTopics: {
          type: "array",
          items: {
            type: "object",
            required: ["topicId"],
            properties: {
              topicId: {
                type: "string",
              },
              reason: nullableString,
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
    "/",
    createSchema,
    async function (request, reply) {
      const body = request.body;
      const id = uuidv4();

      await db.insert(domains).values({
        id,
        title: body.title,
        description: body.description ?? null,
        hasRadar: body.hasRadar ?? null,
      });

      if (body.topicIds && body.topicIds.length > 0) {
        await db.insert(topicsToDomains).values(
          body.topicIds.map(topicId => ({
            topicId,
            domainId: id,
          })),
        );
      }

      if (body.excludedTopics && body.excludedTopics.length > 0) {
        await db.insert(domainExcludedTopics).values(
          body.excludedTopics.map(entry => ({
            topicId: entry.topicId,
            domainId: id,
            reason: entry.reason ?? null,
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
