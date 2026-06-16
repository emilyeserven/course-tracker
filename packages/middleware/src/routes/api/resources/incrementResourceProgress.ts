import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { findResourceOr404 } from "@/utils/findResourceOr404";
import { idParamSchema } from "@/utils/schemas";

const incrementSchema = {
  schema: {
    description: "Increment a resource's progressCurrent by 1",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:id/incrementProgress",
    incrementSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;

      const resource = await findResourceOr404(reply, id);
      if (!resource) {
        return reply;
      }

      const current = resource.progressCurrent ?? 0;
      const total = resource.progressTotal ?? 0;
      const next = total > 0 ? Math.min(current + 1, total) : current + 1;

      await db
        .update(resources)
        .set({
          progressCurrent: next,
        })
        .where(eq(resources.id, id));

      return {
        status: "ok",
        id,
        progressCurrent: next,
        progressTotal: total,
      };
    },
  );
}
