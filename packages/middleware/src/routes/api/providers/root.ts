import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { CourseProvider } from "@emstack/types";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async (request, reply) => {
      const rawData = await db.query.courseProviders.findMany({
        with: {
          resources: {
            columns: {
              name: true,
              status: true,
            },
          },
        },
      });

      const processedData: Partial<CourseProvider>[] = rawData.map((provider: CourseProvider) => {
        const resources = provider.resources ?? [];
        const countByStatus = (status: string) =>
          resources.filter(c => c.status === status).length;

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
          courseCount: resources.length,
          activeCount: countByStatus("active"),
          inactiveCount: countByStatus("inactive"),
          completeCount: countByStatus("complete"),
          pausedCount: countByStatus("paused"),
        };
      });

      return processedData;
    },
  );
}
