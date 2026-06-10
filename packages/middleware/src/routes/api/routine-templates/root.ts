import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { routineTemplates } from "@/db/schema";
import type { RoutineWeekly } from "@/db/schema";
import { weeklySchema } from "@/utils/schemas";

const createSchema = {
  schema: {
    description: "Create a new routine template",
    body: {
      type: "object",
      required: ["label"],
      properties: {
        label: {
          type: "string",
        },
        weekly: weeklySchema,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async () => {
      const rows = await db.query.routineTemplates.findMany({
        orderBy: (t, {
          asc,
        }) => asc(t.label),
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

      await db.insert(routineTemplates).values({
        id,
        label: body.label,
        weekly: (body.weekly ?? {}) as RoutineWeekly,
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
