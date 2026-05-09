import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { dailies } from "@/db/schema";
import {
  completionSchema,
  criteriaSchema,
  nullableDailyStatusEnum,
  nullableString,
} from "@/utils/schemas";
import type { DailyCompletion, DailyCriteria } from "@emstack/types/src";
import { v4 as uuidv4 } from "uuid";

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
        location: nullableString,
        description: nullableString,
        completions: {
          type: "array",
          items: completionSchema,
        },
        courseProviderId: nullableString,
        courseId: nullableString,
        moduleGroupId: nullableString,
        moduleId: nullableString,
        taskId: nullableString,
        status: nullableDailyStatusEnum,
        criteria: criteriaSchema,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/",
    createSchema,
    async function (request) {
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
        moduleGroupId: body.moduleGroupId ?? null,
        moduleId: body.moduleId ?? null,
        taskId: body.taskId || null,
        status: body.status ?? "active",
        criteria: (body.criteria ?? {}) as DailyCriteria,
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
