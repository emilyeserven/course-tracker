import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { todoDailiesForTask } from "@/utils/todoDailyProjection";

import type { Daily } from "@emstack/types";

const listSchema = {
  schema: {
    description:
      "Task List todos that are due today (or overdue and unfinished), "
      + "projected into the Daily shape for the Do Now / Done-for-the-Day "
      + "tracker. A projection, not a stored entity.",
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/dailies",
    listSchema,
    async function () {
      const tasks = await db.query.tasks.findMany({
        columns: {
          id: true,
          name: true,
        },
        with: {
          todos: {
            columns: {
              id: true,
              name: true,
              status: true,
              dueDate: true,
              location: true,
            },
          },
        },
      });

      const dailies: Daily[] = tasks.flatMap(task => todoDailiesForTask(task));
      return dailies;
    },
  );
}
