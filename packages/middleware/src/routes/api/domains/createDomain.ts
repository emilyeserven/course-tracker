import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { domains, topicsToDomains } from "@/db/schema";
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
        description: {
          type: ["string", "null"],
        },
        hasRadar: {
          type: ["boolean", "null"],
        },
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

      return {
        status: "ok",
        id,
      };
    },
  );
}
