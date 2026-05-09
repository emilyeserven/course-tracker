import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { domainExcludedTopics, domains, topicsToDomains } from "@/db/schema";
import { nullableBoolean, nullableString } from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const createSchema = {
  schema: {
    description: "Create a new domain",
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
        withinScopeDescription: nullableString,
        outOfScopeDescription: nullableString,
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

  fastify.post(
    "/",
    createSchema,
    async function (request, reply) {
      const body = request.body;
      const title = body.title.trim();
      if (!title) {
        reply.status(400);
        return {
          error: "Title is required",
        };
      }
      const id = uuidv4();

      await db.insert(domains).values({
        id,
        title,
        description: body.description ?? null,
        hasRadar: body.hasRadar ?? null,
        withinScopeDescription: body.withinScopeDescription ?? null,
        outOfScopeDescription: body.outOfScopeDescription ?? null,
      });

      const uniqueTopicIds = Array.from(new Set(body.topicIds ?? []));
      if (uniqueTopicIds.length > 0) {
        await db.insert(topicsToDomains).values(
          uniqueTopicIds.map(topicId => ({
            topicId,
            domainId: id,
          })),
        );
      }

      const dedupedExcluded = new Map<string, string | null>();
      for (const entry of body.excludedTopics ?? []) {
        if (!dedupedExcluded.has(entry.topicId)) {
          dedupedExcluded.set(entry.topicId, entry.reason ?? null);
        }
      }
      if (dedupedExcluded.size > 0) {
        await db.insert(domainExcludedTopics).values(
          Array.from(dedupedExcluded.entries()).map(([topicId, reason]) => ({
            topicId,
            domainId: id,
            reason,
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
