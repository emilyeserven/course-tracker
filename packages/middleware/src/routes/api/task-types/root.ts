import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { taskTypes } from "@/db/schema";
import { nullableString, tagsArraySchema } from "@/utils/schemas";

const createSchema = {
  schema: {
    description: "Create a new task type",
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        whenToUse: nullableString,
        tags: tagsArraySchema,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async () => {
      const rows = await db.query.taskTypes.findMany({
        orderBy: (t, {
          asc,
        }) => asc(t.name),
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

      await db.insert(taskTypes).values({
        id,
        name: body.name,
        whenToUse: body.whenToUse ?? null,
        tags: body.tags ?? [],
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
