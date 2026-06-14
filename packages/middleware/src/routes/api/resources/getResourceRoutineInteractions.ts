import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { sendNotFound } from "@/utils/errors";
import { routineInteractionsForResource } from "@/utils/routineInteractions";
import { getTaskIdsForResource } from "@/utils/taskResourceLinks";
import { idParamSchema } from "@/utils/schemas";

import type { RoutineInteraction } from "@emstack/types";

const listSchema = {
  schema: {
    description:
      "Routine completions whose scheduled day-action touched this resource "
      + "(directly, or via a task linked to it). Projection, not a stored entity.",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id/routine-interactions",
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

      // Tasks linked to this resource — resolved live (links are stable; only the
      // per-day scheduled item is frozen in entryRef).
      const taskIds = await getTaskIdsForResource(id);

      const routines = await db.query.routines.findMany({
        columns: {
          id: true,
          name: true,
          mode: true,
          weekly: true,
          curated: true,
          completions: true,
        },
      });

      const results: RoutineInteraction[] = routines.flatMap(routine =>
        routineInteractionsForResource(routine, id, taskIds));

      // Newest first, matching the manual interactions list ordering.
      results.sort((a, b) => b.date.localeCompare(a.date));
      return results;
    },
  );
}
