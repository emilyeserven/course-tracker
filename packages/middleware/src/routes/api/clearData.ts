import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { clearData } from "@/db/clearData";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<ZodTypeProvider>();

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
