import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, topicsToCourses } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

const upsertSchema = {
  schema: {
    description: "Create or update a course",
    params: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        description: {
          type: ["string", "null"],
        },
        url: {
          type: ["string", "null"],
        },
        status: {
          type: "string",
          enum: ["active", "inactive", "complete"],
        },
        progressCurrent: {
          type: ["integer", "null"],
        },
        progressTotal: {
          type: ["integer", "null"],
        },
        cost: {
          type: ["string", "null"],
        },
        isCostFromPlatform: {
          type: "boolean",
        },
        dateExpires: {
          type: ["string", "null"],
        },
        isExpires: {
          type: ["boolean", "null"],
        },
        topicId: {
          type: ["string", "null"],
        },
        courseProviderId: {
          type: ["string", "null"],
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/:id",
    upsertSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const body = request.body;

      const courseData = {
        id: id || uuidv4(),
        name: body.name,
        description: body.description ?? null,
        url: body.url ?? null,
        status: body.status as "active" | "inactive" | "complete" | undefined,
        progressCurrent: body.progressCurrent ?? null,
        progressTotal: body.progressTotal ?? null,
        cost: body.cost ?? null,
        isCostFromPlatform: body.isCostFromPlatform ?? false,
        dateExpires: body.dateExpires ?? null,
        isExpires: body.isExpires ?? null,
        courseProviderId: body.courseProviderId ?? null,
      };

      await db
        .insert(courses)
        .values(courseData)
        .onConflictDoUpdate({
          target: courses.id,
          set: {
            name: courseData.name,
            description: courseData.description,
            url: courseData.url,
            status: courseData.status,
            progressCurrent: courseData.progressCurrent,
            progressTotal: courseData.progressTotal,
            cost: courseData.cost,
            isCostFromPlatform: courseData.isCostFromPlatform,
            dateExpires: courseData.dateExpires,
            isExpires: courseData.isExpires,
            courseProviderId: courseData.courseProviderId,
          },
        });

      await db.delete(topicsToCourses).where(eq(topicsToCourses.courseId, courseData.id));
      if (body.topicId) {
        await db.insert(topicsToCourses).values({
          topicId: body.topicId,
          courseId: courseData.id,
        });
      }

      return {
        status: "ok",
        id: courseData.id,
      };
    },
  );
}
