import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { processResourceLinks } from "@/utils/processResourceLinks";
import { idParamSchema } from "@/utils/schemas";

const testSchema = {
  schema: {
    description: "Get a single topic by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    testSchema,
    async function (request) {
      const {
        id,
      } = request.params;
      const topic = await db.query.topics.findFirst({
        where: (topics, {
          eq,
        }) => (eq(topics.id, id)),
        with: {
          topicsToResources: {
            with: {
              resource: {
                columns: {
                  name: true,
                  id: true,
                },
              },
              moduleGroup: {
                columns: {
                  id: true,
                  name: true,
                },
              },
              module: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          radarBlips: {
            with: {
              domain: {
                columns: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          topicsToTags: {
            with: {
              tag: true,
            },
            orderBy: (j, {
              asc,
            }) => asc(j.position),
          },
        },
      });

      if (topic) {
        const resourceCount = topic.topicsToResources?.length ?? 0;
        const resources = processResourceLinks(topic.topicsToResources, "resource");

        const domainsById = new Map<string, {
          id: string;
          title: string;
        }>();
        for (const blip of topic.radarBlips ?? []) {
          if (blip.domain && !domainsById.has(blip.domain.id)) {
            domainsById.set(blip.domain.id, {
              id: blip.domain.id,
              title: blip.domain.title,
            });
          }
        }
        const domains = Array.from(domainsById.values());
        const tags = (topic.topicsToTags ?? []).map(j => j.tag);

        const resourceLinks = (topic.topicsToResources ?? []).map(j => ({
          id: j.id,
          resourceId: j.resourceId,
          resource: j.resource
            ? {
              id: j.resource.id,
              name: j.resource.name,
            }
            : null,
          moduleGroupId: j.moduleGroupId ?? null,
          moduleGroup: j.moduleGroup
            ? {
              id: j.moduleGroup.id,
              name: j.moduleGroup.name,
            }
            : null,
          moduleId: j.moduleId ?? null,
          module: j.module
            ? {
              id: j.module.id,
              name: j.module.name,
            }
            : null,
          position: null,
        }));

        return {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          reason: topic.reason,
          resourceCount: resourceCount,
          resources: resources,
          domains,
          tags,
          resourceLinks,
        };
      }
    },
  );
}
