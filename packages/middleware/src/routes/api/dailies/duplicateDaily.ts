import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { dailies } from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const duplicateSchema = {
  schema: {
    description: "Duplicate a daily by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:id/duplicate",
    duplicateSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;

      const source = await db.query.dailies.findFirst({
        where: (d, {
          eq,
        }) => eq(d.id, id),
      });

      if (!source) {
        reply.status(404);
        return {
          error: "Daily not found",
        };
      }

      const newId = uuidv4();
      await db.insert(dailies).values({
        id: newId,
        name: `${source.name} (Copy)`,
        location: source.location ?? null,
        description: source.description ?? null,
        completions: [],
        courseProviderId: source.courseProviderId ?? null,
        courseId: source.courseId ?? null,
      });

      return {
        status: "ok",
        id: newId,
      };
    },
  );
}
