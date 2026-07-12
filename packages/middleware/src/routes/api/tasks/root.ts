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
        bookmarks: {
          orderBy: (b, {
            asc,
          }) => asc(b.position),
        },
        todos: {
          with: {
            bookmarks: {
              orderBy: (b, {
                asc,
              }) => asc(b.position),
            },
          },
          orderBy: (t, {
            asc,
          }) => asc(t.position),
        },
      },
    });

    const processedData: Task[] = rawData.map(mapTask);

    return processedData;
  });
}
