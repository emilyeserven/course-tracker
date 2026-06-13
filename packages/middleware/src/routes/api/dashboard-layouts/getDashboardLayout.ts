import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { idParamSchema } from "@/utils/schemas";
import { sendNotFound } from "@/utils/errors";

const schema = {
  schema: {
    description: "Get a single dashboard layout by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    schema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const layout = await db.query.dashboardLayouts.findFirst({
        where: (t, {
          eq,
        }) => eq(t.id, id),
      });

      if (!layout) {
        return sendNotFound(reply, "Dashboard layout");
      }

      return layout;
    },
  );
}
