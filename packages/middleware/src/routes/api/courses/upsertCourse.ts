import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { courses, topicsToCourses } from "@/db/schema";
import {
  idParamSchema,
  nullableBoolean,
  nullableInteger,
  nullableString,
} from "@/utils/schemas";
import { syncJunctionTable } from "@/utils/syncJunctionTable";
import { v4 as uuidv4 } from "uuid";

const upsertSchema = {
  schema: {
    description: "Create or update a course",
    params: idParamSchema,
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        description: nullableString,
        url: nullableString,
        status: {
          type: "string",
          enum: ["active", "inactive", "complete"],
        },
        progressCurrent: nullableInteger,
        progressTotal: nullableInteger,
        cost: nullableString,
        isCostFromPlatform: {
          type: "boolean",
        },
        dateExpires: nullableString,
        isExpires: nullableBoolean,
        topicId: nullableString,
        courseProviderId: nullableString,
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

      await syncJunctionTable(
        topicsToCourses,
        topicsToCourses.courseId,
        courseData.id,
        body.topicId
          ? [{
            topicId: body.topicId,
            courseId: courseData.id,
          }]
          : [],
      );

      return {
        status: "ok",
        id: courseData.id,
      };
    },
  );
}
