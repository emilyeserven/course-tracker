import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { Domain } from "@emstack/types";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";

const getDomainSchema = {
  schema: {
    description: "Get a single domain by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    getDomainSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const domain = await db.query.domains.findFirst({
        where: (domains, {
          eq,
        }) => (eq(domains.id, id)),
        with: {
          radarBlips: {
            with: {
              topic: {
                with: {
                  topicsToResources: {
                    with: {
                      resource: {
                        columns: {
                          id: true,
                          name: true,
                          progressCurrent: true,
                          progressTotal: true,
                          status: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          excludedTopics: {
            with: {
              topic: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          withinScopeTopics: {
            with: {
              topic: {
                columns: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      if (!domain) {
        return sendNotFound(reply, "Domain");
      }

      const topics = (domain.radarBlips ?? [])
        .map((blip) => {
          const topic = blip.topic;
          if (!topic) {
            return null;
          }
          const resources = (topic.topicsToResources ?? [])
            .map(ttc => ttc.resource)
            .filter((c): c is NonNullable<typeof c> => Boolean(c))
            .map(c => ({
              id: c.id,
              name: c.name,
              progressCurrent: c.progressCurrent ?? null,
              progressTotal: c.progressTotal ?? null,
              status: c.status ?? null,
            }));
          return {
            id: topic.id,
            name: topic.name,
            description: topic.description ?? null,
            reason: topic.reason ?? null,
            resources,
          };
        })
        .filter((t): t is NonNullable<typeof t> => Boolean(t));

      const excludedTopics = (domain.excludedTopics ?? [])
        .map((row) => {
          if (!row.topic) {
            return null;
          }
          return {
            id: row.topic.id,
            name: row.topic.name,
            reason: row.reason ?? null,
          };
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row));

      const withinScopeTopics = (domain.withinScopeTopics ?? [])
        .map((row) => {
          if (!row.topic) {
            return null;
          }
          return {
            id: row.topic.id,
            name: row.topic.name,
            description: row.topic.description ?? null,
          };
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row));

      const result: Domain = {
        id: domain.id,
        title: domain.title,
        description: domain.description,
        radarConfig: domain.radarConfig,
        withinScopeDescription: domain.withinScopeDescription,
        outOfScopeDescription: domain.outOfScopeDescription,
        topicCount: topics.length,
        topics,
        excludedTopics,
        withinScopeTopics,
      };

      return result;
    },
  );
}
