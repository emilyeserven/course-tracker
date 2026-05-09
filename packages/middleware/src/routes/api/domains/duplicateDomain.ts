import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import {
  domainExcludedTopics,
  domains,
  topicsToDomains,
} from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const duplicateSchema = {
  schema: {
    description: "Duplicate a domain by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/:id/duplicate",
    duplicateSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;

      const source = await db.query.domains.findFirst({
        where: (d, {
          eq,
        }) => eq(d.id, id),
        with: {
          topicsToDomains: true,
          excludedTopics: true,
        },
      });

      if (!source) {
        reply.status(404);
        return {
          error: "Domain not found",
        };
      }

      const newId = uuidv4();
      await db.insert(domains).values({
        id: newId,
        title: `${source.title} (Copy)`,
        description: source.description ?? null,
        hasRadar: source.hasRadar ?? null,
        withinScopeDescription: source.withinScopeDescription ?? null,
        outOfScopeDescription: source.outOfScopeDescription ?? null,
      });

      const topicLinks = (source.topicsToDomains ?? []).map(t => ({
        topicId: t.topicId,
        domainId: newId,
      }));
      if (topicLinks.length > 0) {
        await db.insert(topicsToDomains).values(topicLinks);
      }

      const exclusions = (source.excludedTopics ?? []).map(e => ({
        topicId: e.topicId,
        domainId: newId,
        reason: e.reason ?? null,
      }));
      if (exclusions.length > 0) {
        await db.insert(domainExcludedTopics).values(exclusions);
      }

      return {
        status: "ok",
        id: newId,
      };
    },
  );
}
