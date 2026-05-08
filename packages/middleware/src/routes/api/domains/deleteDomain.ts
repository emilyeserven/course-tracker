import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  domainExcludedTopics,
  domainLearningLogEntries,
  domains,
  topicsToDomains,
} from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";

const deleteSchema = {
  schema: {
    description: "Delete a domain by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete("/:id", deleteSchema, async function (request) {
    const {
      id,
    } = request.params;

    await db
      .delete(topicsToDomains)
      .where(eq(topicsToDomains.domainId, id));
    await db
      .delete(domainExcludedTopics)
      .where(eq(domainExcludedTopics.domainId, id));
    await db
      .delete(domainLearningLogEntries)
      .where(eq(domainLearningLogEntries.domainId, id));
    await db.delete(domains).where(eq(domains.id, id));

    return {
      status: "ok",
    };
  });
}
