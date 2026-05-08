import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { domainLearningLogEntries } from "@/db/schema";
import { nullableString } from "@/utils/schemas";

const createSchema = {
  schema: {
    description: "Create a manual learning-log entry for a domain",
    params: {
      type: "object",
      properties: {
        domainId: {
          type: "string",
        },
      },
      required: ["domainId"],
    },
    body: {
      type: "object",
      required: ["date", "description"],
      properties: {
        date: {
          type: "string",
        },
        description: {
          type: "string",
        },
        link: nullableString,
      },
    },
  },
} as const;

const updateSchema = {
  schema: {
    description: "Update a manual learning-log entry",
    params: {
      type: "object",
      properties: {
        domainId: {
          type: "string",
        },
        entryId: {
          type: "string",
        },
      },
      required: ["domainId", "entryId"],
    },
    body: {
      type: "object",
      required: ["date", "description"],
      properties: {
        date: {
          type: "string",
        },
        description: {
          type: "string",
        },
        link: nullableString,
      },
    },
  },
} as const;

const deleteSchema = {
  schema: {
    description: "Delete a manual learning-log entry",
    params: {
      type: "object",
      properties: {
        domainId: {
          type: "string",
        },
        entryId: {
          type: "string",
        },
      },
      required: ["domainId", "entryId"],
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:domainId/learning-log",
    createSchema,
    async function (request) {
      const {
        domainId,
      } = request.params;
      const body = request.body;
      const id = uuidv4();
      await db.insert(domainLearningLogEntries).values({
        id,
        domainId,
        date: body.date,
        description: body.description,
        link: body.link ?? null,
      });
      return {
        status: "ok",
        id,
      };
    },
  );

  fastify.put(
    "/:domainId/learning-log/:entryId",
    updateSchema,
    async function (request, reply) {
      const {
        domainId, entryId,
      } = request.params;
      const body = request.body;
      const result = await db
        .update(domainLearningLogEntries)
        .set({
          date: body.date,
          description: body.description,
          link: body.link ?? null,
        })
        .where(
          and(
            eq(domainLearningLogEntries.id, entryId),
            eq(domainLearningLogEntries.domainId, domainId),
          ),
        )
        .returning({
          id: domainLearningLogEntries.id,
        });
      if (result.length === 0) {
        reply.status(404);
        return {
          error: "Entry not found",
        };
      }
      return {
        status: "ok",
      };
    },
  );

  fastify.delete(
    "/:domainId/learning-log/:entryId",
    deleteSchema,
    async function (request) {
      const {
        domainId, entryId,
      } = request.params;
      await db
        .delete(domainLearningLogEntries)
        .where(
          and(
            eq(domainLearningLogEntries.id, entryId),
            eq(domainLearningLogEntries.domainId, domainId),
          ),
        );
      return {
        status: "ok",
      };
    },
  );
}
