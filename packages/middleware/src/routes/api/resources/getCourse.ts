import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { processCost } from "@/utils/processCost";
import { processTopics } from "@/utils/processTopics";
import { idParamSchema } from "@/utils/schemas";
import type { Course, CourseFromServer, DailyCompletion } from "@emstack/types/src";

const testSchema = {
  schema: {
    description: "Get a single course by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/:id", testSchema, async function (request, reply) {
    const {
      id,
    } = request.params;
    const course = await db.query.courses.findFirst({
      where: (courses, {
        eq,
      }) => eq(courses.id, id),
      with: {
        courseProvider: {
          with: {
            courses: true,
          },
        },
        topicsToCourses: {
          with: {
            topic: {
              columns: {
                name: true,
                id: true,
              },
            },
          },
        },
        dailies: {
          columns: {
            id: true,
            name: true,
            location: true,
            description: true,
            completions: true,
          },
        },
      },
    });

    if (course) {
      const costData = processCost(course as CourseFromServer);

      const topics = processTopics(course.topicsToCourses);

      const rawData: Course = {
        id: course.id,
        name: course.name,
        description: course.description,
        url: course.url,
        cost: costData,
        dateExpires: course.dateExpires,
        progressCurrent: course.progressCurrent ? course.progressCurrent : 0,
        progressTotal: course.progressTotal ? course.progressTotal : 0,
        status: course.status ?? "inactive",
        topics: topics,
        provider:
          course.courseProvider?.name && course.courseProvider?.id
            ? {
              name: course.courseProvider.name,
              id: course.courseProvider.id,
            }
            : undefined,
        dailies: (course.dailies ?? []).map(d => ({
          id: d.id,
          name: d.name,
          location: d.location,
          description: d.description,
          completions: (d.completions ?? []) as DailyCompletion[],
        })),
      };

      return rawData;
    }
  });
}
