import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { DynamicTest } from "@emstack/types/src";
import { z } from "zod";

const testSchema = {
  schema: {
    description: "It's like looking into a mirror...",
    params: z.object({
      test: z.string(),
    }),
  },
};

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<ZodTypeProvider>();

  fastify.get(
    "/:test",
    testSchema,
    async function (request, reply) {
      const {
        test,
      } = request.params;
      const returnValue: DynamicTest = test;
      return returnValue;
    },
  );
}
