import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { routines } from "@/db/schema";
import type { TopicForTopicsPage } from "@emstack/types";

// Task ids referenced by any daily-mode routine, via its weekly grid entries
// or a routine_connections link. Drives the topics page's dailyCount (how many
// of a topic's tasks are tracked as a daily).
async function dailyTrackedTaskIds(): Promise<Set<string>> {
  const dailyRoutines = await db.query.routines.findMany({
    where: eq(routines.mode, "daily"),
    columns: {
      weekly: true,
    },
    with: {
      connections: {
        columns: {
          connectedType: true,
          connectedId: true,
        },
      },
    },
  });

  const taskIds = new Set<string>();
  for (const routine of dailyRoutines) {
    for (const entry of Object.values(routine.weekly ?? {})) {
      if (entry?.type === "task" && entry.id) {
        taskIds.add(entry.id);
      }
    }
    for (const connection of routine.connections) {
      if (connection.connectedType === "task") {
        taskIds.add(connection.connectedId);
      }
    }
  }
  return taskIds;
}

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async () => {
      const rawData = await db.query.topics.findMany({
        with: {
          topicsToResources: {
            with: {
              resource: {
                columns: {
                  name: true,
                },
              },
            },
          },
          radarBlips: {
            with: {
              domain: {
                columns: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          tasks: {
            columns: {
              id: true,
            },
          },
        },
      });

      const dailyTaskIds = await dailyTrackedTaskIds();

      const processedData: TopicForTopicsPage[] = rawData.map((topic) => {
        const resourceCount = topic.topicsToResources?.length ?? 0;
        const taskCount = topic.tasks?.length ?? 0;
        const dailyCount
          = topic.tasks?.filter(t => dailyTaskIds.has(t.id)).length ?? 0;

        const domainsById = new Map<string, { id: string;
          title: string; }>();
        for (const blip of topic.radarBlips ?? []) {
          if (blip.domain?.id && blip.domain.title && !domainsById.has(blip.domain.id)) {
            domainsById.set(blip.domain.id, {
              id: blip.domain.id,
              title: blip.domain.title,
            });
          }
        }

        return {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          reason: topic.reason,
          resourceCount: resourceCount,
          taskCount: taskCount,
          dailyCount: dailyCount,
          domains: Array.from(domainsById.values()),
        };
      });

      return processedData;
    },
  );
}
