import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  domainExcludedTopics,
  radarBlips,
  topics,
  topicsToCourses,
  topicsToDomains,
} from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";

const deleteSchema = {
  schema: {
    description: "Delete a topic by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete("/:id", deleteSchema, async function (request) {
    const {
      id,
    } = request.params;

    await db.delete(radarBlips).where(eq(radarBlips.topicId, id));
    await db
      .delete(topicsToCourses)
      .where(eq(topicsToCourses.topicId, id));
    await db
      .delete(topicsToDomains)
      .where(eq(topicsToDomains.topicId, id));
    await db
      .delete(domainExcludedTopics)
      .where(eq(domainExcludedTopics.topicId, id));
    await db.delete(topics).where(eq(topics.id, id));

    return {
      status: "ok",
    };
  });
}
