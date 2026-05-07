import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { courseProviders } from "@/db/schema";
import {
  idParamSchema,
  nullableBoolean,
  nullableInteger,
  nullableString,
} from "@/utils/schemas";

const upsertSchema = {
  schema: {
    description: "Create or update a provider",
    params: idParamSchema,
    body: {
      type: "object",
      required: ["name", "url"],
      properties: {
        name: {
          type: "string",
        },
        description: nullableString,
        url: {
          type: "string",
        },
        cost: nullableString,
        isRecurring: nullableBoolean,
        recurDate: nullableString,
        recurPeriodUnit: {
          type: ["string", "null"],
          enum: ["days", "months", "years", null],
        },
        recurPeriod: nullableInteger,
        isCourseFeesShared: nullableBoolean,
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

      const providerData = {
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
      };

      await db
        .insert(courseProviders)
        .values(providerData)
        .onConflictDoUpdate({
          target: courseProviders.id,
          set: {
            name: providerData.name,
            description: providerData.description,
            url: providerData.url,
            cost: providerData.cost,
            isRecurring: providerData.isRecurring,
            recurDate: providerData.recurDate,
            recurPeriodUnit: providerData.recurPeriodUnit,
            recurPeriod: providerData.recurPeriod,
            isCourseFeesShared: providerData.isCourseFeesShared,
          },
        });

      return {
        status: "ok",
      };
    },
  );
}
