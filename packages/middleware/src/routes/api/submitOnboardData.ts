import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/submitOnboardData",
    async (request, reply) => {
      console.log(request.body);
      return {
        status: "ok",
      };
    },
  );
}
