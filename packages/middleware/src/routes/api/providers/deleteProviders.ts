import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { courseProviders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const deleteProviderSchema = {
  schema: {
    description: "It's like looking into a mirror...",
    params: z.object({
      id: z.string(),
    }),
  },
};

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<ZodTypeProvider>();

  fastify.delete(
    "/:id",
    deleteProviderSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      await db.delete(courseProviders).where(eq(courseProviders.id, id));

      return {
        status: "ok",
      };
    },
  );
}
