import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { processCourses } from "@/utils/processCourses";
import { idParamSchema } from "@/utils/schemas";

const testSchema = {
  schema: {
    description: "Get a single topic by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    testSchema,
    async function (request) {
      const {
        id,
      } = request.params;
      const topic = await db.query.topics.findFirst({
        where: (topics, {
          eq,
        }) => (eq(topics.id, id)),
        with: {
          topicsToCourses: {
            with: {
              course: {
                columns: {
                  name: true,
                  id: true,
                },
              },
            },
          },
          radarBlips: {
            with: {
              domain: {
                columns: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      if (topic) {
        const courseCount = topic.topicsToCourses?.length ?? 0;
        const courses = processCourses(topic.topicsToCourses);

        const domainsById = new Map<string, {
          id: string;
          title: string;
        }>();
        for (const blip of topic.radarBlips ?? []) {
          if (blip.domain && !domainsById.has(blip.domain.id)) {
            domainsById.set(blip.domain.id, {
              id: blip.domain.id,
              title: blip.domain.title,
            });
          }
        }
        const domains = Array.from(domainsById.values());

        return {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          reason: topic.reason,
          courseCount: courseCount,
          courses: courses,
          domains,
        };
      }
    },
  );
}
