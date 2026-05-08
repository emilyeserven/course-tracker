import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Task } from "@emstack/types/src";
import { idParamSchema } from "@/utils/schemas";

const getSchema = {
  schema: {
    description: "Get a single task by ID",
    params: idParamSchema,
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

      const task = await db.query.tasks.findFirst({
        where: (tasks, {
          eq,
        }) => eq(tasks.id, id),
        with: {
          topic: {
            columns: {
              id: true,
              name: true,
            },
          },
          resources: true,
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

      if (!task) {
        return null;
      }

      const result: Task = {
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
          })),
        daily: task.daily
          ? {
            id: task.daily.id,
            name: task.daily.name,
            status: task.daily.status ?? null,
            completions: task.daily.completions ?? [],
          }
          : null,
      };

      return result;
    },
  );
}
