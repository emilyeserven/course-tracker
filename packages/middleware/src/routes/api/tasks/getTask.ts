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
          tasksToResources: {
            with: {
              resource: {
                columns: {
                  id: true,
                  name: true,
                },
              },
              moduleGroup: {
                columns: {
                  id: true,
                  name: true,
                },
              },
              module: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: (j, {
              asc,
            }) => asc(j.position),
          },
          resources: {
            with: {
              taskResourcesToTags: {
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
        taskTypeId: task.taskTypeId ?? null,
        taskType: task.taskType
          ? {
            id: task.taskType.id,
            name: task.taskType.name,
            tags: task.taskType.tags ?? [],
          }
          : null,
        tags: (task.tasksToTags ?? []).map(j => j.tag),
        resourceLinks: (task.tasksToResources ?? []).map(j => ({
          id: j.id,
          resourceId: j.resourceId,
          resource: j.resource
            ? {
              id: j.resource.id,
              name: j.resource.name,
            }
            : null,
          moduleGroupId: j.moduleGroupId ?? null,
          moduleGroup: j.moduleGroup
            ? {
              id: j.moduleGroup.id,
              name: j.moduleGroup.name,
            }
            : null,
          moduleId: j.moduleId ?? null,
          module: j.module
            ? {
              id: j.module.id,
              name: j.module.name,
            }
            : null,
          position: j.position ?? null,
        })),
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
            tags: (r.taskResourcesToTags ?? []).map(j => j.tag),
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
      };

      return result;
    },
  );
}
