import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { domainExcludedTopics, domains, topicsToDomains } from "@/db/schema";
import { idParamSchema, nullableBoolean, nullableString } from "@/utils/schemas";
import { syncJunctionTable } from "@/utils/syncJunctionTable";

const upsertSchema = {
  schema: {
    description: "Create or update a domain",
    params: idParamSchema,
    body: {
      type: "object",
      required: ["title"],
      properties: {
        title: {
          type: "string",
          minLength: 1,
        },
        description: nullableString,
        hasRadar: nullableBoolean,
        topicIds: {
          type: "array",
          items: {
            type: "string",
          },
        },
        excludedTopics: {
          type: "array",
          items: {
            type: "object",
            required: ["topicId"],
            properties: {
              topicId: {
                type: "string",
              },
              reason: nullableString,
            },
          },
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/:id",
    upsertSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const body = request.body;

      const title = body.title.trim();
      if (!title) {
        reply.status(400);
        return {
          error: "Title is required",
        };
      }

      const domainData = {
        id,
        title,
        description: body.description ?? null,
        hasRadar: body.hasRadar ?? null,
      };

      await db
        .insert(domains)
        .values(domainData)
        .onConflictDoUpdate({
          target: domains.id,
          set: {
            title: domainData.title,
            description: domainData.description,
            hasRadar: domainData.hasRadar,
          },
        });

      await syncJunctionTable(
        topicsToDomains,
        topicsToDomains.domainId,
        id,
        (body.topicIds ?? []).map(topicId => ({
          topicId,
          domainId: id,
        })),
      );

      const dedupedExclusions = new Map<string, string | null>();
      for (const entry of body.excludedTopics ?? []) {
        if (!dedupedExclusions.has(entry.topicId)) {
          dedupedExclusions.set(entry.topicId, entry.reason ?? null);
        }
      }
      await syncJunctionTable(
        domainExcludedTopics,
        domainExcludedTopics.domainId,
        id,
        Array.from(dedupedExclusions.entries()).map(([topicId, reason]) => ({
          topicId,
          domainId: id,
          reason,
        })),
      );

      return {
        status: "ok",
      };
    },
  );
}
