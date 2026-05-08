import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Daily, DailyCompletion, DailyCriteria } from "@emstack/types/src";

const getSchema = {
  schema: {
    description: "Get a daily by id",
    params: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    getSchema,
    async function (request) {
      const {
        id,
      } = request.params;
      const daily = await db.query.dailies.findFirst({
        where: (dailies, {
          eq,
        }) => eq(dailies.id, id),
        with: {
          courseProvider: {
            columns: {
              id: true,
              name: true,
            },
          },
          course: {
            columns: {
              id: true,
              name: true,
              progressCurrent: true,
              progressTotal: true,
            },
          },
          task: {
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
          },
        },
      });

      if (daily) {
        const taskRecord = daily.task;
        const taskBlock = taskRecord
          ? {
            id: taskRecord.id,
            name: taskRecord.name,
            progress: {
              todosTotal: taskRecord.todos?.length ?? 0,
              todosComplete:
                taskRecord.todos?.filter(t => t.isComplete).length ?? 0,
              resourcesTotal: taskRecord.resources?.length ?? 0,
              resourcesUsed:
                taskRecord.resources?.filter(r => r.usedYet).length ?? 0,
            },
          }
          : null;

        const result: Daily = {
          id: daily.id,
          name: daily.name,
          location: daily.location,
          description: daily.description,
          completions: (daily.completions ?? []) as DailyCompletion[],
          status: daily.status ?? "active",
          criteria: (daily.criteria ?? {}) as DailyCriteria,
          taskId: daily.taskId ?? null,
          task: taskBlock,
          provider:
            daily.courseProvider?.name && daily.courseProvider?.id
              ? {
                name: daily.courseProvider.name,
                id: daily.courseProvider.id,
              }
              : undefined,
          course:
            daily.course?.id && daily.course?.name
              ? {
                id: daily.course.id,
                name: daily.course.name,
                progressCurrent: daily.course.progressCurrent ?? 0,
                progressTotal: daily.course.progressTotal ?? 0,
              }
              : undefined,
        };

        return result;
      }
    },
  );
}
