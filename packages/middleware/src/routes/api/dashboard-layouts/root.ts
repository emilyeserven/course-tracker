import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { dashboardLayouts } from "@/db/schema";
import type { DashboardLayoutTile } from "@/db/schema";
import { dashboardLayoutTilesSchema, nullableInteger } from "@/utils/schemas";

const createSchema = {
  schema: {
    description: "Create a new dashboard layout",
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
        },
        position: nullableInteger,
        tiles: dashboardLayoutTilesSchema,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async () => {
      const rows = await db.query.dashboardLayouts.findMany({
        orderBy: (t, {
          asc,
        }) => [asc(t.position), asc(t.name)],
      });
      return rows;
    },
  );

  fastify.post(
    "/",
    createSchema,
    async function (request) {
      const body = request.body;
      const id = uuidv4();

      await db.insert(dashboardLayouts).values({
        id,
        name: body.name,
        position: body.position ?? null,
        tiles: (body.tiles ?? []) as DashboardLayoutTile[],
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
