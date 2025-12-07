import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { clearData } from "@/db/clearData";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/clearData",
    async (request, reply) => {
      await clearData();
      return {
        status: "ok",
      };
    },
  );
}
