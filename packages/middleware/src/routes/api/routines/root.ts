import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", async () => {
    return await db.query.routines.findMany({
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
  });
}
