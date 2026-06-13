import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";

const testSchema = {
  schema: {
    description: "Get a single provider by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    testSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const provider = await db.query.courseProviders.findFirst({
        where: (providers, {
          eq,
        }) => (eq(providers.id, id)),
        with: {
          resources: true,
        },
      });

      if (!provider) {
        return sendNotFound(reply, "Provider");
      }

      const resourceCount = provider.resources?.length ?? 0;
      const resources = provider.resources.map(resource => ({
        name: resource.name,
        id: resource.id,
      }));

      return {
        id: provider.id,
        name: provider.name,
        description: provider.description,
        url: provider.url,
        cost: provider.cost,
        isRecurring: provider.isRecurring,
        recurDate: provider.recurDate,
        recurPeriodUnit: provider.recurPeriodUnit,
        recurPeriod: provider.recurPeriod,
        isCourseFeesShared: provider.isCourseFeesShared,
        resourceCount: resourceCount,
        resources: resources,
      };
    },
  );
}
