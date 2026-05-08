import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";

const incrementSchema = {
  schema: {
    description: "Increment a course's progressCurrent by 1",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:id/incrementProgress",
    incrementSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;

      const course = await db.query.courses.findFirst({
        where: (courses, {
          eq,
        }) => eq(courses.id, id),
      });

      if (!course) {
        return reply.status(404).send({
          status: "error",
          message: "Course not found",
        });
      }

      const current = course.progressCurrent ?? 0;
      const total = course.progressTotal ?? 0;
      const next = total > 0 ? Math.min(current + 1, total) : current + 1;

      await db
        .update(courses)
        .set({
          progressCurrent: next,
        })
        .where(eq(courses.id, id));

      return {
        status: "ok",
        id,
        progressCurrent: next,
        progressTotal: total,
      };
    },
  );
}
