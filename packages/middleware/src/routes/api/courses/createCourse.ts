import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

const createSchema = {
  schema: {
    description: "Create a new course",
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        description: {
          type: ["string", "null"],
        },
        url: {
          type: ["string", "null"],
        },
        status: {
          type: "string",
          enum: ["active", "inactive", "complete"],
        },
        progressCurrent: {
          type: ["integer", "null"],
        },
        progressTotal: {
          type: ["integer", "null"],
        },
        cost: {
          type: ["string", "null"],
        },
        isCostFromPlatform: {
          type: "boolean",
        },
        dateExpires: {
          type: ["string", "null"],
        },
        isExpires: {
          type: ["boolean", "null"],
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/",
    createSchema,
    async function (request, reply) {
      const body = request.body;
      const id = uuidv4();

      await db.insert(courses).values({
        id,
        name: body.name,
        description: body.description ?? null,
        url: body.url ?? null,
        status: body.status as "active" | "inactive" | "complete" | undefined,
        progressCurrent: body.progressCurrent ?? null,
        progressTotal: body.progressTotal ?? null,
        cost: body.cost ?? null,
        isCostFromPlatform: body.isCostFromPlatform ?? false,
        dateExpires: body.dateExpires ?? null,
        isExpires: body.isExpires ?? null,
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
