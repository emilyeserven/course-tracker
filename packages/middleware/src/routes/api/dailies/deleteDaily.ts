import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { dailies } from "@/db/schema";
import { eq } from "drizzle-orm";

const deleteSchema = {
  schema: {
    description: "Delete a daily by id",
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
      await db.delete(dailies).where(eq(dailies.id, id));

      return {
        status: "ok",
      };
    },
  );
}
