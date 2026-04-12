import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { courseProviders } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

const createSchema = {
  schema: {
    description: "Create a new provider",
    body: {
      type: "object",
      required: ["name", "url"],
      properties: {
        name: {
          type: "string",
        },
        description: {
          type: ["string", "null"],
        },
        url: {
          type: "string",
        },
        cost: {
          type: ["string", "null"],
        },
        isRecurring: {
          type: ["boolean", "null"],
        },
        recurDate: {
          type: ["string", "null"],
        },
        recurPeriodUnit: {
          type: ["string", "null"],
          enum: ["days", "months", "years", null],
        },
        recurPeriod: {
          type: ["integer", "null"],
        },
        isCourseFeesShared: {
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

      await db.insert(courseProviders).values({
        id,
        name: body.name,
        description: body.description ?? null,
        url: body.url,
        cost: body.cost ?? null,
        isRecurring: body.isRecurring ?? null,
        recurDate: body.recurDate ?? null,
        recurPeriodUnit: body.recurPeriodUnit as "days" | "months" | "years" | undefined,
        recurPeriod: body.recurPeriod ?? null,
        isCourseFeesShared: body.isCourseFeesShared ?? null,
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
