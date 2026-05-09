import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { nullableInteger, nullableString } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const createSchema = {
  schema: {
    description: "Create a new tag",
    body: {
      type: "object",
      required: ["name", "groupId"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
        },
        groupId: {
          type: "string",
          minLength: 1,
        },
        color: nullableString,
        position: nullableInteger,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", async () => {
    const rows = await db.query.tags.findMany({
      orderBy: (t, { asc }) => [asc(t.position), asc(t.name)],
    });
    return rows;
  });

  fastify.post("/", createSchema, async function (request) {
    const body = request.body;
    const id = uuidv4();

    await db.insert(tags).values({
      id,
      groupId: body.groupId,
      name: body.name,
      color: body.color ?? null,
      position: body.position ?? null,
    });

    return {
      status: "ok",
      id,
    };
  });
}
