import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { routines } from "@/db/schema";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const duplicateSchema = {
  schema: {
    description: "Duplicate a routine by ID",
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

      const source = await db.query.routines.findFirst({
        where: (r, {
          eq,
        }) => eq(r.id, id),
      });

      if (!source) {
        return sendNotFound(reply, "Routine");
      }

      const newId = uuidv4();
      // The copy starts "inactive" so duplicating never silently steals the
      // topic's single active slot.
      await db.insert(routines).values({
        id: newId,
        name: `${source.name} (Copy)`,
        description: source.description ?? null,
        topicId: source.topicId ?? null,
        status: "inactive",
        weekly: source.weekly ?? {},
      });

      return {
        status: "ok",
        id: newId,
      };
    },
  );
}
