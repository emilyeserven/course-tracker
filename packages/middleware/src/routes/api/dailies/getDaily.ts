import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { mapDaily } from "@/utils/dailyProjection";
import { idParamSchema } from "@/utils/schemas";

const getSchema = {
  schema: {
    description: "Get a daily by id",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    getSchema,
    async function (request) {
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
          resource: {
            columns: {
              id: true,
              name: true,
              progressCurrent: true,
              progressTotal: true,
            },
          },
          task: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              resources: {
                columns: {
                  id: true,
                  usedYet: true,
                },
              },
              todos: {
                columns: {
                  id: true,
                  isComplete: true,
                },
              },
            },
          },
        },
      });

      if (daily) {
        return mapDaily(daily);
      }
    },
  );
}
