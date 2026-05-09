import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { interactions } from "@/db/schema";
import { nullableString } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const interactionProgressEnumSchema = {
  type: "string",
  enum: ["incomplete", "started", "complete"],
} as const;

const nullableInteractionDifficultyEnum = {
  type: ["string", "null"],
  enum: ["easy", "medium", "hard", null],
} as const;

const nullableInteractionUnderstandingEnum = {
  type: ["string", "null"],
  enum: ["none", "basic", "comfortable", "proficient", "mastered", null],
} as const;

const listSchema = {
  schema: {
    description:
      "List interactions, optionally filtered by resourceId, moduleGroupId, or moduleId",
    querystring: {
      type: "object",
      properties: {
        resourceId: {
          type: "string",
        },
        moduleGroupId: {
          type: "string",
        },
        moduleId: {
          type: "string",
        },
      },
    },
  },
} as const;

const createSchema = {
  schema: {
    description: "Create a new interaction",
    body: {
      type: "object",
      required: ["resourceId", "date", "progress"],
      properties: {
        resourceId: {
          type: "string",
          minLength: 1,
        },
        moduleGroupId: nullableString,
        moduleId: nullableString,
        date: {
          type: "string",
        },
        progress: interactionProgressEnumSchema,
        note: nullableString,
        difficulty: nullableInteractionDifficultyEnum,
        understanding: nullableInteractionUnderstandingEnum,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", listSchema, async function (request) {
    const {
      resourceId, moduleGroupId, moduleId,
    } = request.query;
    const rows = await db.query.interactions.findMany({
      where: (i, {
        and, eq,
      }) => {
        const conds = [];
        if (resourceId) conds.push(eq(i.resourceId, resourceId));
        if (moduleGroupId) conds.push(eq(i.moduleGroupId, moduleGroupId));
        if (moduleId) conds.push(eq(i.moduleId, moduleId));
        if (conds.length === 0) return undefined;
        if (conds.length === 1) return conds[0];
        return and(...conds);
      },
      orderBy: (i, {
        desc,
      }) => [desc(i.date), desc(i.id)],
    });
    return rows;
  });

  fastify.post("/", createSchema, async function (request) {
    const body = request.body;
    const id = uuidv4();

    await db.insert(interactions).values({
      id,
      resourceId: body.resourceId,
      moduleGroupId: body.moduleGroupId ?? null,
      moduleId: body.moduleId ?? null,
      date: body.date,
      progress: body.progress,
      note: body.note ?? null,
      difficulty: body.difficulty ?? null,
      understanding: body.understanding ?? null,
    });

    return {
      status: "ok",
      id,
    };
  });
}
