import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";

// Surgical update of just the resource's module naming conventions. Lives apart
// from the full upsert so the Modules tab can save labels without re-sending
// (and risking clobbering) the rest of the resource's columns.
const updateSchema = {
  schema: {
    description: "Update a resource's module naming conventions (group/module labels)",
    params: idParamSchema,
    body: {
      type: "object",
      required: ["modulesConfig"],
      properties: {
        modulesConfig: {
          type: "object",
          required: ["groupLabel", "moduleLabel"],
          properties: {
            groupLabel: {
              type: "string",
            },
            moduleLabel: {
              type: "string",
            },
          },
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/:id/modulesConfig",
    updateSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const {
        modulesConfig,
      } = request.body;

      const resource = await db.query.resources.findFirst({
        where: (resources, {
          eq,
        }) => eq(resources.id, id),
      });

      if (!resource) {
        return sendNotFound(reply, "Resource");
      }

      await db
        .update(resources)
        .set({
          modulesConfig,
        })
        .where(eq(resources.id, id));

      return {
        status: "ok",
        id,
        modulesConfig,
      };
    },
  );
}
