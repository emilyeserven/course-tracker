import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Daily, DailyCompletion } from "@emstack/types/src";

const getSchema = {
  schema: {
    description: "Get a daily by id",
    params: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    getSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const daily = await db.query.dailies.findFirst({
        where: (dailies, {
          eq,
        }) => eq(dailies.id, id),
        with: {
          courseProvider: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (daily) {
        const result: Daily = {
          id: daily.id,
          name: daily.name,
          location: daily.location,
          description: daily.description,
          completions: (daily.completions ?? []) as DailyCompletion[],
          provider:
            daily.courseProvider?.name && daily.courseProvider?.id
              ? {
                name: daily.courseProvider.name,
                id: daily.courseProvider.id,
              }
              : undefined,
        };

        return result;
      }
    },
  );
}
