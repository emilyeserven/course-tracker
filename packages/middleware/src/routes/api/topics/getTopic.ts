import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { TopicsFromServer } from "@emstack/types/src/TopicsFromServer";

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
      const topic: TopicsFromServer | undefined = await db.query.topics.findFirst({
        where: (courses, {
          eq,
        }) => (eq(courses.id, id)),
        with: {
          topicsToCourses: {
            with: {
              course: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (topic) {
        const courseCount = topic.topicsToCourses?.length ?? 0;

        return {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          reason: topic.reason,
          courseCount: courseCount,
        };
      }
    },
  );
}
