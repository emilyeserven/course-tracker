import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import {
  domains,
  domainWithinScopeTopics,
} from "@/db/schema";
import { sendBadRequest } from "@/utils/errors";
import { nullableString } from "@/utils/schemas";
import { syncDomainMembershipByDomain } from "@/utils/syncMembershipBlips";
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

  fastify.post(
    "/",
    createSchema,
    async function (request, reply) {
      const body = request.body;
      const title = body.title.trim();
      if (!title) {
        return sendBadRequest(reply, "Title is required");
      }
      const id = uuidv4();

      await db.insert(domains).values({
        id,
        title,
        description: body.description ?? null,
        withinScopeDescription: body.withinScopeDescription ?? null,
        outOfScopeDescription: body.outOfScopeDescription ?? null,
      });

      const uniqueTopicIds = Array.from(new Set(body.topicIds ?? []));
      if (uniqueTopicIds.length > 0) {
        await syncDomainMembershipByDomain(id, uniqueTopicIds);
      }

      const uniqueWithinScopeTopicIds = Array.from(
        new Set(body.withinScopeTopicIds ?? []),
      );
      if (uniqueWithinScopeTopicIds.length > 0) {
        await db.insert(domainWithinScopeTopics).values(
          uniqueWithinScopeTopicIds.map(topicId => ({
            topicId,
            domainId: id,
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
