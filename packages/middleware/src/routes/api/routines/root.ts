import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { nullableRoutineModeEnum } from "@/utils/schemas";
import { resolveRoutineConnections } from "@/utils/resolveRoutineConnections";
import {
  mapRoutineToDaily,
  representativeEntry,
  type RoutineRow,
} from "@/utils/routineProjection";

const listSchema = {
  schema: {
    description: "List routines, optionally filtered by mode",
    querystring: {
      type: "object",
      properties: {
        mode: nullableRoutineModeEnum,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", listSchema, async (request) => {
    const {
      mode,
    } = request.query;

    const routinesList = await db.query.routines.findMany({
      where: mode
        ? (routines, {
          eq,
        }) => eq(routines.mode, mode)
        : undefined,
      with: {
        connections: true,
      },
    });

    const withConnections = await resolveRoutineConnections(routinesList);

    // Only the daily-mode list is projected into the Daily shape (task/resource
    // progress) for the tracker. Weekly and unfiltered lists return raw routines
    // plus resolved connections; the client resolves schedule names itself.
    if (mode !== "daily") {
      return withConnections;
    }

    // Batch-resolve every representative task/resource id up front to avoid N+1.
    const taskIds: string[] = [];
    const resourceIds: string[] = [];
    for (const routine of withConnections) {
      const entry = representativeEntry(routine.weekly);
      if (entry?.type === "task") {
        taskIds.push(entry.id);
      }
      else if (entry?.type === "resource") {
        resourceIds.push(entry.id);
      }
    }

    const taskRows = taskIds.length
      ? await db.query.tasks.findMany({
        where: (tasks, {
          inArray,
        }) => inArray(tasks.id, taskIds),
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
      })
      : [];

    const resourceRows = resourceIds.length
      ? await db.query.resources.findMany({
        where: (resources, {
          inArray,
        }) => inArray(resources.id, resourceIds),
        columns: {
          id: true,
          name: true,
          progressCurrent: true,
          progressTotal: true,
        },
      })
      : [];

    const taskMap = new Map(taskRows.map(t => [t.id, t]));
    const resourceMap = new Map(resourceRows.map(r => [r.id, r]));

    return withConnections.map((routine) => {
      const entry = representativeEntry(routine.weekly);
      const task = entry?.type === "task"
        ? taskMap.get(entry.id) ?? null
        : null;
      const resource = entry?.type === "resource"
        ? resourceMap.get(entry.id) ?? null
        : null;
      return mapRoutineToDaily(routine as RoutineRow, {
        task,
        resource,
      });
    });
  });
}
