import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { usersTable } from "@/db/schema.ts";
import { db } from "@/db";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/dbTest",
    async (request, reply) => {
      const result = await db.select().from(usersTable);

      return result;
    },
  );
}
