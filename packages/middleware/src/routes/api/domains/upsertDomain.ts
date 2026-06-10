import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import {
  domains,
  domainWithinScopeTopics,
} from "@/db/schema";
import { sendBadRequest } from "@/utils/errors";
import { idParamSchema, nullableString } from "@/utils/schemas";
import { syncDomainMembershipByDomain } from "@/utils/syncMembershipBlips";
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
        withinScopeDescription: nullableString,
        outOfScopeDescription: nullableString,
        topicIds: {
          type: "array",
          items: {
            type: "string",
          },
        },
        withinScopeTopicIds: {
          type: "array",
          items: {
            type: "string",
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
        return sendBadRequest(reply, "Title is required");
      }

      const row = {
        id,
        title,
        description: body.description ?? null,
        withinScopeDescription: body.withinScopeDescription ?? null,
        outOfScopeDescription: body.outOfScopeDescription ?? null,
      };

      await db
        .insert(domains)
        .values(row)
        .onConflictDoUpdate({
          target: domains.id,
          set: {
            title: row.title,
            description: row.description,
            withinScopeDescription: row.withinScopeDescription,
            outOfScopeDescription: row.outOfScopeDescription,
          },
        });

      if (body.topicIds !== undefined) {
        await syncDomainMembershipByDomain(id, Array.from(new Set(body.topicIds)));
      }

      if (body.withinScopeTopicIds !== undefined) {
        await syncJunctionTable(
          domainWithinScopeTopics,
          domainWithinScopeTopics.domainId,
          id,
          Array.from(new Set(body.withinScopeTopicIds)).map(topicId => ({
            topicId,
            domainId: id,
          })),
        );
      }

      return {
        status: "ok",
      };
    },
  );
}
