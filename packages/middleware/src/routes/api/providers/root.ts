import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { CourseProvider } from "@emstack/types/src";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async (request, reply) => {
      const rawData = await db.query.courseProviders.findMany({
        with: {
          courses: {
            columns: {
              name: true,
            },
          },
        },
      });

      const processedData: Partial<CourseProvider>[] = rawData.map((provider: CourseProvider) => {
        const courseCount = provider.courses?.length ?? 0;

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
          courseCount: courseCount,
        };
      });

      return processedData;
    },
  );
}
