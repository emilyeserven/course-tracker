import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  buildActionableSentence,
  routineEntryName,
} from "@emstack/types";

import { db } from "@/db";
import { routines, taskTodos, tasks } from "@/db/schema";
import { sendBadRequest, sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";

import type { DailyCompletionStatus, RoutineReferenceItem } from "@emstack/types";

const convertSchema = {
  schema: {
    description:
      "Convert a curated routine into a Task List: each dated entry becomes a "
      + "todo (due date, status), then the routine is archived "
      + "(status = inactive). Returns the new task id.",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:id/convert-to-task-list",
    convertSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;

      const routine = await db.query.routines.findFirst({
        where: (r, {
          eq: eqOp,
        }) => eqOp(r.id, id),
        columns: {
          id: true,
          name: true,
          description: true,
          mode: true,
          curated: true,
          completions: true,
        },
      });

      if (!routine) {
        return sendNotFound(reply, "Routine");
      }
      if (routine.mode !== "curated") {
        return sendBadRequest(reply, "Only curated routines can be converted to a Task List.");
      }

      const entries = routine.curated?.entries ?? {};
      const dateKeys = Object.keys(entries)
        .filter(key => entries[key]?.id)
        .sort();

      // status logged per date (curated completions are keyed by date).
      const statusByDate = new Map<string, DailyCompletionStatus>();
      for (const c of routine.completions ?? []) {
        if (c.status) {
          statusByDate.set(c.date, c.status);
        }
      }

      // Batch-resolve task names so each todo's name reads the same as the
      // routine's schedule did. Bookmark and freeform entries carry their own
      // display label on the entry.
      const taskIds = new Set<string>();
      for (const key of dateKeys) {
        const entry = entries[key] as RoutineReferenceItem;
        if (entry.type === "task") {
          taskIds.add(entry.id);
        }
      }

      const taskRows = taskIds.size
        ? await db.query.tasks.findMany({
          where: (t, {
            inArray,
          }) => inArray(t.id, [...taskIds]),
          columns: {
            id: true,
            name: true,
          },
        })
        : [];

      const taskNames = new Map(taskRows.map(r => [r.id, r.name]));

      const newTaskId = uuidv4();
      const todoRows = dateKeys.map((key, index) => {
        const entry = entries[key] as RoutineReferenceItem;
        const baseName = routineEntryName(entry, taskNames);
        return {
          id: uuidv4(),
          taskId: newTaskId,
          name: buildActionableSentence({
            prependText: entry.prependText,
            name: baseName,
            appendText: entry.appendText,
          }),
          status: statusByDate.get(key) ?? "incomplete",
          dueDate: key,
          note: entry.notes ?? null,
          location: entry.location ?? null,
          url: null,
          position: index,
        };
      });

      await db.transaction(async (tx) => {
        await tx.insert(tasks).values({
          id: newTaskId,
          name: routine.name,
          description: routine.description ?? null,
          dueDate: routine.curated?.endDate ?? null,
          taskTypeId: null,
        });
        if (todoRows.length) {
          await tx.insert(taskTodos).values(todoRows);
        }
        // Archive the source routine.
        await tx
          .update(routines)
          .set({
            status: "inactive",
          })
          .where(eq(routines.id, id));
      });

      return reply.code(201).send({
        id: newTaskId,
      });
    },
  );
}
