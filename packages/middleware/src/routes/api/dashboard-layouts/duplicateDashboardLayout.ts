import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { dashboardLayouts } from "@/db/schema";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";

const duplicateSchema = {
  schema: {
    description: "Duplicate a dashboard layout by ID",
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

      const source = await db.query.dashboardLayouts.findFirst({
        where: (l, {
          eq,
        }) => eq(l.id, id),
      });

      if (!source) {
        return sendNotFound(reply, "Dashboard layout");
      }

      // A duplicated preset stays a preset (no tab position); a duplicated tab
      // is placed at the end of the strip.
      let position: number | null = null;
      if (!source.isTemplate) {
        const rows = await db.query.dashboardLayouts.findMany();
        const maxPosition = rows.reduce(
          (max, l) => (l.isTemplate ? max : Math.max(max, l.position ?? 0)),
          -1,
        );
        position = maxPosition + 1;
      }

      const newId = uuidv4();
      await db.insert(dashboardLayouts).values({
        id: newId,
        name: `${source.name} (Copy)`,
        position,
        tiles: source.tiles,
        isTemplate: source.isTemplate,
      });

      return {
        status: "ok",
        id: newId,
      };
    },
  );
}
