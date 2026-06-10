import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { routines } from "@/db/schema";
import type { RoutineWeekly } from "@/db/schema";
import {
  nullableRoutineStatusEnum,
  nullableString,
  weeklySchema,
} from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const createSchema = {
  schema: {
    description: "Create a new routine",
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

  fastify.post(
    "/",
    createSchema,
    async function (request) {
      const body = request.body;
      const id = uuidv4();
      const status = body.status ?? "active";
      const topicId = body.topicId || null;

      await db.transaction(async (tx) => {
        await tx.insert(routines).values({
          id,
          name: body.name,
          description: body.description ?? null,
          topicId,
          status,
          weekly: (body.weekly ?? {}) as RoutineWeekly,
        });

        // Single-active-per-topic enforcement: a new active routine claims the
        // topic's active slot, deactivating its siblings.
        if (status === "active" && topicId) {
          await tx
            .update(routines)
            .set({
              status: "inactive",
            })
            .where(and(eq(routines.topicId, topicId), ne(routines.id, id)));
        }
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
