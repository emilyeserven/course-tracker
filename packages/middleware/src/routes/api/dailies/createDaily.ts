import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { dailies } from "@/db/schema";
import type { DailyCompletion } from "@emstack/types/src";
import { v4 as uuidv4 } from "uuid";

const completionSchema = {
  type: "object",
  required: ["date"],
  properties: {
    date: {
      type: "string",
    },
    status: {
      type: "string",
      enum: ["incomplete", "touched", "goal", "exceeded", "freeze"],
    },
    note: {
      type: "string",
    },
  },
} as const;

const createSchema = {
  schema: {
    description: "Create a new daily",
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        location: {
          type: ["string", "null"],
        },
        description: {
          type: ["string", "null"],
        },
        completions: {
          type: "array",
          items: completionSchema,
        },
        courseProviderId: {
          type: ["string", "null"],
        },
        courseId: {
          type: ["string", "null"],
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

      await db.insert(dailies).values({
        id,
        name: body.name,
        location: body.location ?? null,
        description: body.description ?? null,
        completions: (body.completions ?? []) as DailyCompletion[],
        courseProviderId: body.courseProviderId ?? null,
        courseId: body.courseId ?? null,
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
