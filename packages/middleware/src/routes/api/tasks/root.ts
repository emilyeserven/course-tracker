import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { mapTask } from "@/utils/taskProjection";
import type { Task } from "@emstack/types";

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
      },
    });

    const processedData: Task[] = rawData.map(mapTask);

    return processedData;
  });
}
