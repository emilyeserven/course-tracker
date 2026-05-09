import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { modules } from "@/db/schema";
import { nullableInteger, nullableString } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const listSchema = {
  schema: {
    description: "List modules (optionally filtered by courseId or moduleGroupId)",
    querystring: {
      type: "object",
      properties: {
        courseId: {
          type: "string",
        },
        moduleGroupId: {
          type: "string",
        },
      },
    },
  },
} as const;

const createSchema = {
  schema: {
    description: "Create a new module",
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
        moduleGroupId: nullableString,
        description: nullableString,
        url: nullableString,
        minutesLength: nullableInteger,
        isComplete: {
          type: "boolean",
        },
        position: nullableInteger,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", listSchema, async function (request) {
    const { courseId, moduleGroupId } = request.query;
    const rows = await db.query.modules.findMany({
      where: (m, { and, eq }) => {
        const conds = [];
        if (courseId) conds.push(eq(m.courseId, courseId));
        if (moduleGroupId) conds.push(eq(m.moduleGroupId, moduleGroupId));
        if (conds.length === 0) return undefined;
        if (conds.length === 1) return conds[0];
        return and(...conds);
      },
      orderBy: (m, { asc }) => [asc(m.position), asc(m.name)],
    });
    return rows;
  });

  fastify.post("/", createSchema, async function (request) {
    const body = request.body;
    const id = uuidv4();

    await db.insert(modules).values({
      id,
      courseId: body.courseId,
      moduleGroupId: body.moduleGroupId ?? null,
      name: body.name,
      description: body.description ?? null,
      url: body.url ?? null,
      minutesLength: body.minutesLength ?? null,
      isComplete: body.isComplete ?? false,
      position: body.position ?? null,
    });

    return {
      status: "ok",
      id,
    };
  });
}
