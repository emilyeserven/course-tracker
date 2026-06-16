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
      + "todo (due date, status, resource link), then the routine is archived "
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

      // Batch-resolve names for task/resource/module/group references so each
      // todo's name reads the same as the routine's schedule did.
      const taskIds = new Set<string>();
      const resourceIds = new Set<string>();
      const moduleIds = new Set<string>();
      const moduleGroupIds = new Set<string>();
      for (const key of dateKeys) {
        const entry = entries[key] as RoutineReferenceItem;
        if (entry.type === "task") {
          taskIds.add(entry.id);
        }
        else if (entry.type === "resource") {
          resourceIds.add(entry.id);
          if (entry.moduleId) moduleIds.add(entry.moduleId);
          if (entry.moduleGroupId) moduleGroupIds.add(entry.moduleGroupId);
        }
      }

      const [taskRows, resourceRows, moduleRows, moduleGroupRows] = await Promise.all([
        taskIds.size
          ? db.query.tasks.findMany({
            where: (t, {
              inArray,
            }) => inArray(t.id, [...taskIds]),
            columns: {
              id: true,
              name: true,
            },
          })
          : Promise.resolve([]),
        resourceIds.size
          ? db.query.resources.findMany({
            where: (r, {
              inArray,
            }) => inArray(r.id, [...resourceIds]),
            columns: {
              id: true,
              name: true,
            },
          })
          : Promise.resolve([]),
        moduleIds.size
          ? db.query.modules.findMany({
            where: (m, {
              inArray,
            }) => inArray(m.id, [...moduleIds]),
            columns: {
              id: true,
              name: true,
            },
          })
          : Promise.resolve([]),
        moduleGroupIds.size
          ? db.query.moduleGroups.findMany({
            where: (g, {
              inArray,
            }) => inArray(g.id, [...moduleGroupIds]),
            columns: {
              id: true,
              name: true,
            },
          })
          : Promise.resolve([]),
      ]);

      const taskNames = new Map(taskRows.map(r => [r.id, r.name]));
      const resourceNames = new Map(resourceRows.map(r => [r.id, r.name]));
      const moduleNames = new Map(moduleRows.map(r => [r.id, r.name]));
      const moduleGroupNames = new Map(moduleGroupRows.map(r => [r.id, r.name]));

      const newTaskId = uuidv4();
      const todoRows = dateKeys.map((key, index) => {
        const entry = entries[key] as RoutineReferenceItem;
        const baseName = routineEntryName(
          entry,
          taskNames,
          resourceNames,
          moduleNames,
          moduleGroupNames,
        );
        const isResource = entry.type === "resource";
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
          resourceId: isResource ? entry.id : null,
          moduleGroupId: isResource ? entry.moduleGroupId ?? null : null,
          moduleId: isResource ? entry.moduleId ?? null : null,
        };
      });

      await db.transaction(async (tx) => {
        await tx.insert(tasks).values({
          id: newTaskId,
          name: routine.name,
          description: routine.description ?? null,
          dueDate: routine.curated?.endDate ?? null,
          topicId: null,
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
