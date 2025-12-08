import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";

const testSchema = {
  schema: {
    description: "It's like looking into a mirror...",
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
    testSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const provider = await db.query.courseProviders.findFirst({
        where: (courses, {
          eq,
        }) => (eq(courses.id, id)),
        with: {
          courses: true,
        },
      });

      if (provider) {
        const courseCount = provider.courses?.length ?? 0;
        const courses = provider.courses.map((course) => {
          if (course) {
            return {
              name: course.name,
              id: course.id,
            };
          }
        });

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
          courses: courses,
        };
      }
    },
  );
}
