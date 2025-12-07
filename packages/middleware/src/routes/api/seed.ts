import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { seed } from "@/db/seed";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/seed",
    async (request, reply) => {
      await seed();
      return {
        status: "ok",
      };
    },
  );
}
