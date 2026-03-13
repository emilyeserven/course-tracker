import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { seed } from "@/db/seed";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<ZodTypeProvider>();

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
