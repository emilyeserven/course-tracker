import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { moduleGroups } from "@/db/schema";
import { nullableInteger, nullableString } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const listSchema = {
  schema: {
    description: "List module groups (optionally filtered by courseId)",
    querystring: {
      type: "object",
      properties: {
        courseId: {
          type: "string",
        },
      },
    },
  },
} as const;

const createSchema = {
  schema: {
    description: "Create a new module group",
    body: {
      type: "object",
      required: ["name", "courseId"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
        },
        courseId: {
          type: "string",
          minLength: 1,
        },
        description: nullableString,
        url: nullableString,
        position: nullableInteger,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", listSchema, async function (request) {
    const { courseId } = request.query;
    const rows = await db.query.moduleGroups.findMany({
      where: courseId
        ? (g, { eq: eqOp }) => eqOp(g.courseId, courseId)
        : undefined,
      with: {
        modules: {
          orderBy: (m, { asc }) => [asc(m.position), asc(m.name)],
        },
      },
      orderBy: (g, { asc }) => [asc(g.position), asc(g.name)],
    });
    return rows;
  });

  fastify.post("/", createSchema, async function (request) {
    const body = request.body;
    const id = uuidv4();

    await db.insert(moduleGroups).values({
      id,
      courseId: body.courseId,
      name: body.name,
      description: body.description ?? null,
      url: body.url ?? null,
      position: body.position ?? null,
    });

    return {
      status: "ok",
      id,
    };
  });
}
