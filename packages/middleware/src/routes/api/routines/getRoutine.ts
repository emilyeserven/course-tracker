import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { idParamSchema } from "@/utils/schemas";

const getSchema = {
  schema: {
    description: "Get a routine by id",
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

      return await db.query.routines.findFirst({
        where: (routines, {
          eq,
        }) => eq(routines.id, id),
        with: {
          topic: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });
    },
  );
}
