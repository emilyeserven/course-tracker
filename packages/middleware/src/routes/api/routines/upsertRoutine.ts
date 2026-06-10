import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { routines } from "@/db/schema";
import type { RoutineWeekly } from "@/db/schema";
import {
  idParamSchema,
  nullableRoutineStatusEnum,
  nullableString,
  weeklySchema,
} from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const upsertSchema = {
  schema: {
    description: "Create or update a routine",
    params: idParamSchema,
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        description: nullableString,
        topicId: nullableString,
        status: nullableRoutineStatusEnum,
        weekly: weeklySchema,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/:id",
    upsertSchema,
    async function (request) {
      const {
        id,
      } = request.params;
      const body = request.body;

      const routineData = {
        id: id || uuidv4(),
        name: body.name,
        description: body.description ?? null,
        topicId: body.topicId || null,
        status: body.status ?? "active",
        weekly: (body.weekly ?? {}) as RoutineWeekly,
      };

      await db.transaction(async (tx) => {
        await tx
          .insert(routines)
          .values(routineData)
          .onConflictDoUpdate({
            target: routines.id,
            set: {
              name: routineData.name,
              description: routineData.description,
              topicId: routineData.topicId,
              status: routineData.status,
              weekly: routineData.weekly,
            },
          });

        // Single-active-per-topic enforcement: activating this routine
        // deactivates its siblings on the same topic.
        if (routineData.status === "active" && routineData.topicId) {
          await tx
            .update(routines)
            .set({
              status: "inactive",
            })
            .where(
              and(
                eq(routines.topicId, routineData.topicId),
                ne(routines.id, routineData.id),
              ),
            );
        }
      });

      return {
        status: "ok",
        id: routineData.id,
      };
    },
  );
}
