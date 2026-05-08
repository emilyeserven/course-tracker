import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { resources, tasks } from "@/db/schema";
import { nullableString } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const resourceLevel = {
  type: ["string", "null"],
  enum: ["low", "medium", "high", null],
} as const;

const resourceSchema = {
  type: "object",
  required: ["name"],
  properties: {
    id: {
      type: "string",
    },
    name: {
      type: "string",
    },
    url: nullableString,
    easeOfStarting: resourceLevel,
    timeNeeded: resourceLevel,
    interactivity: resourceLevel,
    usedYet: {
      type: "boolean",
    },
  },
} as const;

const createSchema = {
  schema: {
    description: "Create a new task",
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        description: nullableString,
        topicId: nullableString,
        resources: {
          type: "array",
          items: resourceSchema,
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/",
    createSchema,
    async function (request) {
      const body = request.body;
      const id = uuidv4();

      await db.insert(tasks).values({
        id,
        name: body.name,
        description: body.description ?? null,
        topicId: body.topicId || null,
      });

      const incoming = body.resources ?? [];
      if (incoming.length > 0) {
        await db.insert(resources).values(
          incoming.map((r, index) => ({
            id: r.id || uuidv4(),
            taskId: id,
            name: r.name,
            url: r.url ?? null,
            easeOfStarting: r.easeOfStarting ?? null,
            timeNeeded: r.timeNeeded ?? null,
            interactivity: r.interactivity ?? null,
            usedYet: r.usedYet ?? false,
            position: index,
          })),
        );
      }

      return {
        status: "ok",
        id,
      };
    },
  );
}
