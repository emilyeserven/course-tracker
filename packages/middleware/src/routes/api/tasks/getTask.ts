import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Task } from "@emstack/types";
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
                  easeOfStarting: true,
                  timeNeeded: true,
                  interactivity: true,
                },
              },
              moduleGroup: {
                columns: {
                  id: true,
                  name: true,
                  easeOfStarting: true,
                  timeNeeded: true,
                  interactivity: true,
                },
              },
              module: {
                columns: {
                  id: true,
                  name: true,
                  easeOfStarting: true,
                  timeNeeded: true,
                  interactivity: true,
                },
              },
            },
            orderBy: (j, {
              asc,
            }) => asc(j.position),
          },
          resources: {
            with: {
              resource: {
                columns: {
                  id: true,
                  name: true,
                  easeOfStarting: true,
                  timeNeeded: true,
                  interactivity: true,
                },
              },
              moduleGroup: {
                columns: {
                  id: true,
                  name: true,
                  easeOfStarting: true,
                  timeNeeded: true,
                  interactivity: true,
                },
              },
              module: {
                columns: {
                  id: true,
                  name: true,
                  easeOfStarting: true,
                  timeNeeded: true,
                  interactivity: true,
                },
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
              easeOfStarting: j.resource.easeOfStarting ?? null,
              timeNeeded: j.resource.timeNeeded ?? null,
              interactivity: j.resource.interactivity ?? null,
            }
            : null,
          moduleGroupId: j.moduleGroupId ?? null,
          moduleGroup: j.moduleGroup
            ? {
              id: j.moduleGroup.id,
              name: j.moduleGroup.name,
              easeOfStarting: j.moduleGroup.easeOfStarting ?? null,
              timeNeeded: j.moduleGroup.timeNeeded ?? null,
              interactivity: j.moduleGroup.interactivity ?? null,
            }
            : null,
          moduleId: j.moduleId ?? null,
          module: j.module
            ? {
              id: j.module.id,
              name: j.module.name,
              easeOfStarting: j.module.easeOfStarting ?? null,
              timeNeeded: j.module.timeNeeded ?? null,
              interactivity: j.module.interactivity ?? null,
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
            usedYet: r.usedYet,
            position: r.position,
            resourceId: r.resourceId ?? null,
            resource: r.resource
              ? {
                id: r.resource.id,
                name: r.resource.name,
                easeOfStarting: r.resource.easeOfStarting ?? null,
                timeNeeded: r.resource.timeNeeded ?? null,
                interactivity: r.resource.interactivity ?? null,
              }
              : null,
            moduleGroupId: r.moduleGroupId ?? null,
            moduleGroup: r.moduleGroup
              ? {
                id: r.moduleGroup.id,
                name: r.moduleGroup.name,
                easeOfStarting: r.moduleGroup.easeOfStarting ?? null,
                timeNeeded: r.moduleGroup.timeNeeded ?? null,
                interactivity: r.moduleGroup.interactivity ?? null,
              }
              : null,
            moduleId: r.moduleId ?? null,
            module: r.module
              ? {
                id: r.module.id,
                name: r.module.name,
                easeOfStarting: r.module.easeOfStarting ?? null,
                timeNeeded: r.module.timeNeeded ?? null,
                interactivity: r.module.interactivity ?? null,
              }
              : null,
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
