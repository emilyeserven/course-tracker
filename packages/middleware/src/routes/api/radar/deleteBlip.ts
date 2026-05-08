import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { radarBlips } from "@/db/schema";

const deleteBlipSchema = {
  schema: {
    description: "Delete a blip from a domain's radar",
    params: {
      type: "object",
      properties: {
        domainId: {
          type: "string",
        },
        blipId: {
          type: "string",
        },
      },
      required: ["domainId", "blipId"],
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete(
    "/:domainId/radar/blips/:blipId",
    deleteBlipSchema,
    async function (request) {
      const {
        blipId,
      } = request.params;

      await db.delete(radarBlips).where(eq(radarBlips.id, blipId));

      return {
        status: "ok",
      };
    },
  );
}
