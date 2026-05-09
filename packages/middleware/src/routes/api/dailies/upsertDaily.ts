import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { dailies } from "@/db/schema";
import {
  completionSchema,
  criteriaSchema,
  idParamSchema,
  nullableDailyStatusEnum,
  nullableString,
} from "@/utils/schemas";
import type { DailyCompletion, DailyCriteria } from "@emstack/types/src";
import { v4 as uuidv4 } from "uuid";

const upsertSchema = {
  schema: {
    description: "Create or update a daily",
    params: idParamSchema,
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
        resourceId: nullableString,
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

  fastify.put(
    "/:id",
    upsertSchema,
    async function (request) {
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
        resourceId: body.resourceId ?? null,
        moduleGroupId: body.moduleGroupId ?? null,
        moduleId: body.moduleId ?? null,
        taskId: body.taskId || null,
        status: body.status ?? "active",
        criteria: (body.criteria ?? {}) as DailyCriteria,
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
            resourceId: dailyData.resourceId,
            moduleGroupId: dailyData.moduleGroupId,
            moduleId: dailyData.moduleId,
            taskId: dailyData.taskId,
            status: dailyData.status,
            criteria: dailyData.criteria,
          },
        });

      return {
        status: "ok",
        id: dailyData.id,
      };
    },
  );
}
