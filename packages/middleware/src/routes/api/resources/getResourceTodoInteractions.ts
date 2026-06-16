import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { sendNotFound } from "@/utils/errors";
import { todoInteractionsForResource } from "@/utils/todoInteractions";
import { idParamSchema } from "@/utils/schemas";

import type { TodoInteraction } from "@emstack/types";

const listSchema = {
  schema: {
    description:
      "Task List todo completions whose linked resource is this resource. "
      + "Projection, not a stored entity.",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id/todo-interactions",
    listSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;

      const resource = await db.query.resources.findFirst({
        where: (r, {
          eq,
        }) => eq(r.id, id),
        columns: {
          id: true,
        },
      });
      if (!resource) {
        return sendNotFound(reply, "Resource");
      }

      // Only tasks that actually have a todo linking this resource.
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
              note: true,
              resourceId: true,
            },
          },
        },
      });

      const results: TodoInteraction[] = tasks.flatMap(task =>
        todoInteractionsForResource(task, id));

      // Newest first, matching the manual + routine interaction list ordering.
      results.sort((a, b) => b.date.localeCompare(a.date));
      return results;
    },
  );
}
