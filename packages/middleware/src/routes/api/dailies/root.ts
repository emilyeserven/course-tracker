import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Daily, DailyCompletion, DailyCriteria } from "@emstack/types/src";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", async () => {
    const rawData = await db.query.dailies.findMany({
      with: {
        courseProvider: {
          columns: {
            id: true,
            name: true,
          },
        },
        resource: {
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

    const processedData: Daily[] = rawData.map((daily) => {
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

      return {
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
        resource:
          daily.resource?.id && daily.resource?.name
            ? {
              id: daily.resource.id,
              name: daily.resource.name,
              progressCurrent: daily.resource.progressCurrent ?? 0,
              progressTotal: daily.resource.progressTotal ?? 0,
            }
            : undefined,
        moduleGroupId: daily.moduleGroupId ?? null,
        moduleId: daily.moduleId ?? null,
      };
    });

    return processedData;
  });
}
