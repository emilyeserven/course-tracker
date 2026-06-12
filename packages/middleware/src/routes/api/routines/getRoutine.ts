import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";
import { resolveRoutineConnections } from "@/utils/resolveRoutineConnections";
import {
  mapRoutineToDaily,
  representativeEntry,
  type ResolvedResource,
  type ResolvedTask,
  type RoutineRow,
} from "@/utils/routineProjection";

const getSchema = {
  schema: {
    description: "Get a routine by id",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    getSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;

      const routine = await db.query.routines.findFirst({
        where: (routines, {
          eq,
        }) => eq(routines.id, id),
        with: {
          connections: true,
        },
      });

      if (!routine) {
        return sendNotFound(reply, "Routine");
      }

      const [resolved] = await resolveRoutineConnections([routine]);

      // Weekly-mode routines are returned raw (with resolved connections) — they
      // still carry completions/criteria for the tracking panel; the client
      // resolves schedule names itself.
      if (resolved.mode !== "daily") {
        return resolved;
      }

      // Daily mode: resolve the representative weekly entry so the response is a
      // Daily-compatible shape (task/resource progress) for the tracker UI.
      const entry = representativeEntry(resolved.weekly);
      let task: ResolvedTask | null = null;
      let resource: ResolvedResource | null = null;

      if (entry && entry.type === "task") {
        task = (await db.query.tasks.findFirst({
          where: (tasks, {
            eq,
          }) => eq(tasks.id, entry.id),
          columns: {
            id: true,
            name: true,
          },
          with: {
            resources: {
              columns: {
                id: true,
                usedYet: true,
              },
            },
            todos: {
              columns: {
                id: true,
                isComplete: true,
              },
            },
          },
        })) ?? null;
      }
      else if (entry && entry.type === "resource") {
        resource = (await db.query.resources.findFirst({
          where: (resources, {
            eq,
          }) => eq(resources.id, entry.id),
          columns: {
            id: true,
            name: true,
            progressCurrent: true,
            progressTotal: true,
          },
        })) ?? null;
      }

      return mapRoutineToDaily(resolved as RoutineRow, {
        task,
        resource,
      });
    },
  );
}
