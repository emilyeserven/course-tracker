import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { getBookmarkProgress } from "@/services/bookmarks";
import { nullableRoutineModeEnum } from "@/utils/schemas";
import { resolveRoutineConnections } from "@/utils/resolveRoutineConnections";
import {
  activeBookmarkForEntry,
  currentDateKey,
  entryForCompletionDate,
  firstTaskBookmarkWithProgress,
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
    // freeform entries carry their own display label on the entry.) In the same
    // pass, note each routine's "active bookmark" — strictly today's scheduled
    // bookmark entry — so we can enrich it with reading progress from Simple
    // Bookmarks below. Task days use the task's to-do progress instead, and a
    // routine's categorical bookmark connection never drives the progress ring.
    const taskIds: string[] = [];
    const activeBookmarkByRoutine = new Map<string, { id: string;
      title: string; }>();
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
      const activeBookmark = activeBookmarkForEntry(entry);
      if (activeBookmark) {
        activeBookmarkByRoutine.set(routine.id, activeBookmark);
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
          // A to-do-less task's own bookmark backs its progress ring (below).
          bookmarks: {
            columns: {
              bookmarkId: true,
              title: true,
              position: true,
            },
          },
        },
      })
      : [];

    const taskMap = new Map(taskRows.map(t => [t.id, t]));

    // Enrich active bookmarks with reading progress in a single call (best
    // effort — an unreachable Simple Bookmarks yields an empty map and the
    // dailies still render, falling back to task/infinity progress). Include the
    // bookmarks of any to-do-less task scheduled today, so we can fall back to
    // the task's own reading progress when it has no to-dos to count.
    const bookmarkIds = new Set(
      [...activeBookmarkByRoutine.values()].map(b => b.id),
    );
    for (const task of taskRows) {
      if ((task.todos?.length ?? 0) === 0) {
        for (const bookmark of task.bookmarks ?? []) {
          bookmarkIds.add(bookmark.bookmarkId);
        }
      }
    }
    const progressMap = await getBookmarkProgress([...bookmarkIds]);

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
      const daily = mapRoutineToDaily(routine as RoutineRow, {
        task,
      }, dateKey);

      // The routine's own scheduled bookmark entry drives the ring. When today's
      // item is a task with NO to-dos, fall back to the task's own bookmark
      // reading progress instead (to-do completion takes precedence whenever the
      // task has to-dos). Also drop the empty to-do block so a to-do-less task
      // with no such bookmark shows the infinity icon rather than a "0 / 0" ring.
      let activeBookmark = activeBookmarkByRoutine.get(routine.id);
      if (!activeBookmark && task && (task.todos?.length ?? 0) === 0) {
        activeBookmark
          = firstTaskBookmarkWithProgress(task.bookmarks ?? [], progressMap)
            ?? undefined;
        if (daily.task) {
          daily.task = {
            ...daily.task,
            progress: undefined,
          };
        }
      }

      // Only a positive total is real reading progress; a zero/absent total
      // leaves bookmarkProgress null so the cell shows the infinity icon.
      const progress = activeBookmark && progressMap.get(activeBookmark.id);
      daily.bookmarkProgress = activeBookmark && progress && progress.total > 0
        ? {
          current: progress.current,
          total: progress.total,
          title: activeBookmark.title,
        }
        : null;

      return daily;
    });
  });
}
