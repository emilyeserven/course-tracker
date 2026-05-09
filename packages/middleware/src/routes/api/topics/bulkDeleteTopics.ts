import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  domainExcludedTopics,
  domainWithinScopeTopics,
  radarBlips,
  topics,
  topicsToCourses,
} from "@/db/schema";

const bulkDeleteSchema = {
  schema: {
    description: "Delete multiple topics by ID",
    body: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: {
          type: "array",
          items: {
            type: "string",
          },
          minItems: 1,
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post("/bulk-delete", bulkDeleteSchema, async function (request) {
    const ids = Array.from(new Set(request.body.ids));

    await db.delete(radarBlips).where(inArray(radarBlips.topicId, ids));
    await db
      .delete(topicsToCourses)
      .where(inArray(topicsToCourses.topicId, ids));
    await db
      .delete(domainExcludedTopics)
      .where(inArray(domainExcludedTopics.topicId, ids));
    await db
      .delete(domainWithinScopeTopics)
      .where(inArray(domainWithinScopeTopics.topicId, ids));
    await db.delete(topics).where(inArray(topics.id, ids));

    return {
      status: "ok",
      count: ids.length,
    };
  });
}
