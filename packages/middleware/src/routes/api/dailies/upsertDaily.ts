import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { dailies } from "@/db/schema";
import type { DailyCompletion } from "@emstack/types/src";
import { v4 as uuidv4 } from "uuid";

const completionSchema = {
  type: "object",
  required: ["date", "status"],
  properties: {
    date: {
      type: "string",
    },
    status: {
      type: "string",
      enum: ["incomplete", "touched", "goal", "exceeded"],
    },
  },
} as const;

const upsertSchema = {
  schema: {
    description: "Create or update a daily",
    params: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
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
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/:id",
    upsertSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const body = request.body;

      const dailyData = {
        id: id || uuidv4(),
        name: body.name,
        location: body.location ?? null,
        description: body.description ?? null,
        completions: (body.completions ?? []) as DailyCompletion[],
        courseProviderId: body.courseProviderId ?? null,
      };

      await db
        .insert(dailies)
        .values(dailyData)
        .onConflictDoUpdate({
          target: dailies.id,
          set: {
            name: dailyData.name,
            location: dailyData.location,
            description: dailyData.description,
            completions: dailyData.completions,
            courseProviderId: dailyData.courseProviderId,
          },
        });

      return {
        status: "ok",
        id: dailyData.id,
      };
    },
  );
}
