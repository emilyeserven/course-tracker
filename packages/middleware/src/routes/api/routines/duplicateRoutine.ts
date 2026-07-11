import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { routineConnections, routines } from "@/db/schema";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const duplicateSchema = {
  schema: {
    description: "Duplicate a routine by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:id/duplicate",
    duplicateSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;

      const source = await db.query.routines.findFirst({
        where: (r, {
          eq,
        }) => eq(r.id, id),
      });

      if (!source) {
        return sendNotFound(reply, "Routine");
      }

      const newId = uuidv4();
      // The copy starts "inactive" with an empty completion log so the new
      // routine begins its own tracking history without inheriting the source's.
      await db.insert(routines).values({
        id: newId,
        name: `${source.name} (Copy)`,
        description: source.description ?? null,
        status: "inactive",
        weekly: source.weekly ?? {},
        mode: source.mode,
        completions: [],
        criteria: source.criteria ?? {},
        weeklyTarget: source.weeklyTarget ?? null,
      });

      // Carry the source's connections over to the copy with fresh row ids.
      const sourceConnections = await db
        .select()
        .from(routineConnections)
        .where(eq(routineConnections.routineId, id));
      if (sourceConnections.length > 0) {
        await db.insert(routineConnections).values(
          sourceConnections.map(c => ({
            id: uuidv4(),
            routineId: newId,
            connectedType: c.connectedType,
            connectedId: c.connectedId,
            cachedTitle: c.cachedTitle,
            cachedUrl: c.cachedUrl,
            sectionId: c.sectionId,
            sectionLabel: c.sectionLabel,
            position: c.position,
          })),
        );
      }

      return {
        status: "ok",
        id: newId,
      };
    },
  );
}
