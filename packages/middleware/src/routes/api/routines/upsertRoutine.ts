import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { routines } from "@/db/schema";
import type { RoutineWeekly } from "@/db/schema";
import type { DailyCompletion, DailyCriteria } from "@emstack/types";
import {
  completionSchema,
  criteriaSchema,
  idParamSchema,
  nullableRoutineModeEnum,
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
        mode: nullableRoutineModeEnum,
        location: nullableString,
        completions: {
          type: "array",
          items: completionSchema,
        },
        criteria: criteriaSchema,
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
        id: paramId,
      } = request.params;
      const body = request.body;
      const id = paramId || uuidv4();

      // Partial merge: only the columns present in the request body are written
      // on update. The daily tracker / dashboard / comment popover send partial
      // payloads (e.g. just completions), so this preserves the routine's mode,
      // topic, weekly grid and criteria instead of resetting them to defaults.
      const set: Partial<typeof routines.$inferInsert> = {};
      if (body.name !== undefined) {
        set.name = body.name;
      }
      if (body.description !== undefined) {
        set.description = body.description ?? null;
      }
      if (body.topicId !== undefined) {
        set.topicId = body.topicId || null;
      }
      if (body.status !== undefined) {
        set.status = body.status ?? "active";
      }
      if (body.weekly !== undefined) {
        set.weekly = body.weekly as RoutineWeekly;
      }
      if (body.mode !== undefined) {
        set.mode = body.mode ?? "weekly";
      }
      if (body.location !== undefined) {
        set.location = body.location ?? null;
      }
      if (body.completions !== undefined) {
        set.completions = body.completions as DailyCompletion[];
      }
      if (body.criteria !== undefined) {
        set.criteria = body.criteria as DailyCriteria;
      }

      await db.transaction(async (tx) => {
        await tx
          .insert(routines)
          .values({
            id,
            name: body.name,
            description: body.description ?? null,
            topicId: body.topicId || null,
            status: body.status ?? "active",
            weekly: (body.weekly ?? {}) as RoutineWeekly,
            mode: body.mode ?? "weekly",
            location: body.location ?? null,
            completions: (body.completions ?? []) as DailyCompletion[],
            criteria: (body.criteria ?? {}) as DailyCriteria,
          })
          .onConflictDoUpdate({
            target: routines.id,
            set,
          });

        // Single-active-per-topic enforcement only runs when this request both
        // activates the routine and names its topic, so a partial completion
        // toggle never reshuffles a topic's active slot.
        if (set.status === "active" && set.topicId) {
          await tx
            .update(routines)
            .set({
              status: "inactive",
            })
            .where(
              and(
                eq(routines.topicId, set.topicId),
                ne(routines.id, id),
              ),
            );
        }
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
