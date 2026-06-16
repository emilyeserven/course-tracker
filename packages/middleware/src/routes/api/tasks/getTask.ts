import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { sendNotFound } from "@/utils/errors";
import { mapTask } from "@/utils/taskProjection";
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
    async function (request, reply) {
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
          todos: {
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
            orderBy: (t, {
              asc,
            }) => asc(t.position),
          },
        },
      });

      if (!task) {
        return sendNotFound(reply, "Task");
      }

      return mapTask(task);
    },
  );
}
