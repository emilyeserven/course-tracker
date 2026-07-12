import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { nullableRoutineModeEnum } from "@/utils/schemas";
import { resolveRoutineConnections } from "@/utils/resolveRoutineConnections";
import {
  currentDateKey,
  entryForCompletionDate,
  mapRoutineToDaily,
  type RoutineRow,
} from "@/utils/routineProjection";

const listSchema = {
  schema: {
    description: "List routines, optionally filtered by mode",
    querystring: {
      type: "object",
      properties: {
        mode: nullableRoutineModeEnum,
        // When true, project every returned routine (both modes) into the Daily
        // shape for the tracker / dashboard. `mode=daily` keeps projecting on its
        // own for back-compat.
        projected: {
          type: "boolean",
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", listSchema, async (request) => {
    const {
      mode,
      projected,
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

    // Project into the Daily shape (task progress) when the caller asks for it:
    // `projected=true` covers both modes for the tracker / dashboard, and
    // `mode=daily` keeps projecting on its own for back-compat. Otherwise return
    // raw routines plus resolved connections; the client resolves schedule names.
    const shouldProject = projected === true || mode === "daily";
    if (!shouldProject) {
      return withConnections;
    }

    // Resolve against one "today" for the whole request so id-collection,
    // resolution, and projection all agree on which entry is active. Curated
    // routines key by date, weekly by weekday, daily by representative entry.
    const dateKey = currentDateKey();

    // Batch-resolve every active task id up front to avoid N+1. (Bookmark and
    // freeform entries carry their own display label on the entry.)
    const taskIds: string[] = [];
    for (const routine of withConnections) {
      const entry = entryForCompletionDate(
        routine.mode,
        routine.weekly,
        routine.curated,
        dateKey,
      );
      if (entry?.type === "task") {
        taskIds.push(entry.id);
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
          todos: {
            columns: {
              id: true,
              status: true,
            },
          },
        },
      })
      : [];

    const taskMap = new Map(taskRows.map(t => [t.id, t]));

    return withConnections.map((routine) => {
      const entry = entryForCompletionDate(
        routine.mode,
        routine.weekly,
        routine.curated,
        dateKey,
      );
      const task = entry?.type === "task"
        ? taskMap.get(entry.id) ?? null
        : null;
      return mapRoutineToDaily(routine as RoutineRow, {
        task,
      }, dateKey);
    });
  });
}
