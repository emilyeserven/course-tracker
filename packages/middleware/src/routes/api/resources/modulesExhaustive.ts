import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";

const modulesExhaustiveSchema = {
  schema: {
    description: "Set whether a resource's module list is exhaustive",
    params: idParamSchema,
    body: {
      type: "object",
      required: ["modulesAreExhaustive"],
      additionalProperties: false,
      properties: {
        modulesAreExhaustive: {
          type: "boolean",
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:id/modulesExhaustive",
    modulesExhaustiveSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const {
        modulesAreExhaustive,
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
          modulesAreExhaustive,
        })
        .where(eq(resources.id, id));

      return {
        status: "ok",
        id,
        modulesAreExhaustive,
      };
    },
  );
}
