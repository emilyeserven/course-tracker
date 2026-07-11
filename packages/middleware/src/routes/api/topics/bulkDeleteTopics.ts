import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  routineConnections,
  topics,
  topicsToResources,
  topicsToTags,
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

    await db
      .delete(topicsToResources)
      .where(inArray(topicsToResources.topicId, ids));
    await db
      .delete(topicsToTags)
      .where(inArray(topicsToTags.topicId, ids));
    // routine_connections has no FK on connected_id (polymorphic), so clean up
    // the topics' rows explicitly — they'd dangle forever otherwise.
    await db.delete(routineConnections).where(
      and(
        eq(routineConnections.connectedType, "topic"),
        inArray(routineConnections.connectedId, ids),
      ),
    );
    await db.delete(topics).where(inArray(topics.id, ids));

    return {
      status: "ok",
      count: ids.length,
    };
  });
}
