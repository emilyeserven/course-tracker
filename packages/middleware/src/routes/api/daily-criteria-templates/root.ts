import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { dailyCriteriaTemplates } from "@/db/schema";

const createSchema = {
  schema: {
    description: "Create a new daily criteria template",
    body: {
      type: "object",
      required: ["label"],
      properties: {
        label: {
          type: "string",
        },
        incomplete: {
          type: "string",
        },
        touched: {
          type: "string",
        },
        goal: {
          type: "string",
        },
        exceeded: {
          type: "string",
        },
        freeze: {
          type: "string",
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async () => {
      const rows = await db.query.dailyCriteriaTemplates.findMany({
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

      await db.insert(dailyCriteriaTemplates).values({
        id,
        label: body.label,
        incomplete: body.incomplete ?? "",
        touched: body.touched ?? "",
        goal: body.goal ?? "",
        exceeded: body.exceeded ?? "",
        freeze: body.freeze ?? "",
      });

      return {
        status: "ok",
        id,
      };
    },
  );
}
