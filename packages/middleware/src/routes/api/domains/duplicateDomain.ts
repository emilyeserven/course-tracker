import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import {
  domainExcludedTopics,
  domains,
  domainWithinScopeTopics,
  radarBlips,
} from "@/db/schema";
import { sendNotFound } from "@/utils/errors";
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
          radarBlips: true,
          excludedTopics: true,
          withinScopeTopics: true,
        },
      });

      if (!source) {
        return sendNotFound(reply, "Domain");
      }

      const newId = uuidv4();
      await db.insert(domains).values({
        id: newId,
        title: `${source.title} (Copy)`,
        description: source.description ?? null,
        radarConfig: source.radarConfig,
        withinScopeDescription: source.withinScopeDescription ?? null,
        outOfScopeDescription: source.outOfScopeDescription ?? null,
      });

      const blipCopies = (source.radarBlips ?? []).map(b => ({
        id: uuidv4(),
        domainId: newId,
        topicId: b.topicId,
        quadrantId: b.quadrantId,
        ringId: b.ringId,
        description: b.description ?? null,
      }));
      if (blipCopies.length > 0) {
        await db.insert(radarBlips).values(blipCopies);
      }

      const exclusions = (source.excludedTopics ?? []).map(e => ({
        topicId: e.topicId,
        domainId: newId,
        reason: e.reason ?? null,
      }));
      if (exclusions.length > 0) {
        await db.insert(domainExcludedTopics).values(exclusions);
      }

      const withinScopeLinks = (source.withinScopeTopics ?? []).map(w => ({
        topicId: w.topicId,
        domainId: newId,
      }));
      if (withinScopeLinks.length > 0) {
        await db.insert(domainWithinScopeTopics).values(withinScopeLinks);
      }

      return {
        status: "ok",
        id: newId,
      };
    },
  );
}
