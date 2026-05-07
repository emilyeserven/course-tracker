import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { topics } from "@/db/schema";
import { nullableString } from "@/utils/schemas";
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
        },
        description: nullableString,
        reason: nullableString,
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

      await db.insert(topics).values({
        id,
        name: body.name,
        description: body.description ?? null,
        reason: body.reason ?? null,
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
