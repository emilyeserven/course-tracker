import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { radarBlips } from "@/db/schema";
import { nullableString } from "@/utils/schemas";

const createBlipSchema = {
  schema: {
    description: "Create a new blip on a domain's radar",
    params: {
      type: "object",
      properties: {
        domainId: {
          type: "string",
        },
      },
      required: ["domainId"],
    },
    body: {
      type: "object",
      required: ["name", "quadrantId", "ringId"],
      properties: {
        name: {
          type: "string",
        },
        description: nullableString,
        quadrantId: {
          type: "string",
        },
        ringId: {
          type: "string",
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:domainId/radar/blips",
    createBlipSchema,
    async function (request) {
      const {
        domainId,
      } = request.params;
      const body = request.body;
      const id = uuidv4();

      await db.insert(radarBlips).values({
        id,
        domainId,
        quadrantId: body.quadrantId,
        ringId: body.ringId,
        name: body.name,
        description: body.description ?? null,
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
