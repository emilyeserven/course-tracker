import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyCriteriaTemplates } from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";

const schema = {
  schema: {
    description: "Delete a daily criteria template by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete("/:id", schema, async function (request) {
    const {
      id,
    } = request.params;

    await db.delete(dailyCriteriaTemplates).where(eq(dailyCriteriaTemplates.id, id));

    return {
      status: "ok",
    };
  });
}
