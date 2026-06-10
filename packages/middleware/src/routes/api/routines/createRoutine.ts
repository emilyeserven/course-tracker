import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { routineConnections, routines } from "@/db/schema";
import type { RoutineWeekly } from "@/db/schema";
import type { DailyCompletion, DailyCriteria } from "@emstack/types";
import { buildRoutineConnectionRows } from "@/utils/routineConnectionRows";
import {
  completionSchema,
  criteriaSchema,
  nullableRoutineModeEnum,
  nullableRoutineStatusEnum,
  nullableString,
  routineConnectionsSchema,
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
        connections: routineConnectionsSchema,
        status: nullableRoutineStatusEnum,
        weekly: weeklySchema,
        mode: nullableRoutineModeEnum,
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

  fastify.post(
    "/",
    createSchema,
    async function (request) {
      const body = request.body;
      const id = uuidv4();

      await db.insert(routines).values({
        id,
        name: body.name,
        description: body.description ?? null,
        status: body.status ?? "active",
        weekly: (body.weekly ?? {}) as RoutineWeekly,
        mode: body.mode ?? "weekly",
        completions: (body.completions ?? []) as DailyCompletion[],
        criteria: (body.criteria ?? {}) as DailyCriteria,
      });

      const connectionRows = buildRoutineConnectionRows(body.connections, id);
      if (connectionRows.length > 0) {
        await db.insert(routineConnections).values(connectionRows);
      }

      return {
        status: "ok",
        id,
      };
    },
  );
}
