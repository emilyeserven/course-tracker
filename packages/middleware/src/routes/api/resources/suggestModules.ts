import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import { db } from "@/db";
import {
  MissingApiKeyError,
  suggestModulesForResource,
} from "@/services/moduleSuggester";
import { sendNotFound } from "@/utils/errors";
import { idParamSchema, nullableString } from "@/utils/schemas";

const bodySchema = {
  type: "object",
  properties: {
    notes: nullableString,
  },
} as const;

const schema = {
  schema: {
    description:
      "Use Claude to suggest a module group / module outline for a resource",
    params: idParamSchema,
    body: bodySchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post("/:id/suggest-modules", schema, async (request, reply) => {
    const {
      id,
    } = request.params;
    const body = request.body as { notes?: string | null };

    const resource = await db.query.resources.findFirst({
      where: (resources, {
        eq,
      }) => eq(resources.id, id),
      with: {
        courseProvider: {
          columns: {
            name: true,
          },
        },
        topicsToResources: {
          with: {
            topic: {
              columns: {
                name: true,
              },
            },
          },
        },
        moduleGroups: {
          columns: {
            name: true,
          },
        },
        modules: {
          columns: {
            name: true,
            moduleGroupId: true,
          },
        },
      },
    });

    if (!resource) {
      return sendNotFound(reply, "Resource");
    }

    const existingGroupNames = (resource.moduleGroups ?? []).map(g => g.name);
    const existingUngroupedModuleNames = (resource.modules ?? [])
      .filter(m => !m.moduleGroupId)
      .map(m => m.name);
    const topicNames = (resource.topicsToResources ?? [])
      .map(j => j.topic?.name)
      .filter((n): n is string => !!n);

    try {
      const suggestion = await suggestModulesForResource(
        {
          name: resource.name,
          description: resource.description,
          url: resource.url,
          providerName: resource.courseProvider?.name ?? null,
          topicNames,
          existingGroupNames,
          existingUngroupedModuleNames,
        },
        body?.notes ?? null,
        process.env.ANTHROPIC_API_KEY,
      );
      return suggestion;
    }
    catch (err) {
      if (err instanceof MissingApiKeyError) {
        return reply.status(503).send({
          status: "error",
          message:
            "LLM Assist is unavailable: ANTHROPIC_API_KEY is not configured on the server.",
        });
      }
      const message = err instanceof Error ? err.message : String(err);
      request.log.error({
        err,
      }, "Module suggestion failed");
      return reply.status(502).send({
        status: "error",
        message: `Failed to generate suggestions: ${message}`,
      });
    }
  });
}
