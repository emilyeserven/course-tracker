import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { domains, topicsToDomains } from "@/db/schema";
import { eq } from "drizzle-orm";

const deleteSchema = {
  schema: {
    description: "Delete a domain by ID",
    params: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete(
    "/:id",
    deleteSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      await db.delete(topicsToDomains).where(eq(topicsToDomains.domainId, id));
      await db.delete(domains).where(eq(domains.id, id));

      return {
        status: "ok",
      };
    },
  );
}
