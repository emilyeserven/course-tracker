import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Task } from "@emstack/types/src";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", async () => {
    const rawData = await db.query.tasks.findMany({
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          },
        },
        taskType: {
          columns: {
            id: true,
            name: true,
            tags: true,
          },
        },
        tasksToTags: {
          with: {
            tag: true,
          },
          orderBy: (j, {
            asc,
          }) => asc(j.position),
        },
        resources: {
          with: {
            resourcesToTags: {
              with: {
                tag: true,
              },
              orderBy: (j, {
                asc,
              }) => asc(j.position),
            },
          },
        },
        todos: true,
        daily: {
          columns: {
            id: true,
            name: true,
            status: true,
            completions: true,
          },
        },
      },
    });

    const processedData: Task[] = rawData.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description,
      topicId: task.topicId ?? null,
      topic: task.topic
        ? {
          id: task.topic.id,
          name: task.topic.name,
        }
        : null,
      taskTypeId: task.taskTypeId ?? null,
      taskType: task.taskType
        ? {
          id: task.taskType.id,
          name: task.taskType.name,
          tags: task.taskType.tags ?? [],
        }
        : null,
      tags: (task.tasksToTags ?? []).map(j => j.tag),
      resources: (task.resources ?? [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map(r => ({
          id: r.id,
          taskId: r.taskId,
          name: r.name,
          url: r.url,
          easeOfStarting: r.easeOfStarting,
          timeNeeded: r.timeNeeded,
          interactivity: r.interactivity,
          usedYet: r.usedYet,
          position: r.position,
          tags: (r.resourcesToTags ?? []).map(j => j.tag),
        })),
      todos: (task.todos ?? [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map(t => ({
          id: t.id,
          taskId: t.taskId,
          name: t.name,
          isComplete: t.isComplete,
          url: t.url ?? null,
          position: t.position,
        })),
      daily: task.daily
        ? {
          id: task.daily.id,
          name: task.daily.name,
          status: task.daily.status ?? null,
          completions: task.daily.completions ?? [],
        }
        : null,
    }));

    return processedData;
  });
}
