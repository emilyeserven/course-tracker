import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { courses, topicsToCourses } from "@/db/schema";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const duplicateSchema = {
  schema: {
    description: "Duplicate a course by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:id/duplicate",
    duplicateSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;

      const source = await db.query.courses.findFirst({
        where: (c, {
          eq,
        }) => eq(c.id, id),
        with: {
          topicsToCourses: true,
        },
      });

      if (!source) {
        return sendNotFound(reply, "Course");
      }

      const newId = uuidv4();
      await db.insert(courses).values({
        id: newId,
        name: `${source.name} (Copy)`,
        description: source.description ?? null,
        url: null,
        isCostFromPlatform: source.isCostFromPlatform ?? false,
        progressCurrent: 0,
        progressTotal: source.progressTotal ?? null,
        dateExpires: source.dateExpires ?? null,
        isExpires: source.isExpires ?? null,
        cost: source.cost ?? null,
        status: source.status ?? undefined,
        minutesLength: source.minutesLength ?? null,
        courseProviderId: source.courseProviderId ?? null,
      });

      const topicLinks = (source.topicsToCourses ?? []).map(t => ({
        topicId: t.topicId,
        courseId: newId,
      }));
      if (topicLinks.length > 0) {
        await db.insert(topicsToCourses).values(topicLinks);
      }

      return {
        status: "ok",
        id: newId,
      };
    },
  );
}
