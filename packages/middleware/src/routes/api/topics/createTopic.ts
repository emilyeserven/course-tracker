import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { topics, topicsToResources, topicsToTags } from "@/db/schema";
import {
  nullableString,
  resourceLinksArraySchema,
  tagIdsArraySchema,
} from "@/utils/schemas";
import { syncDomainMembershipByTopic } from "@/utils/syncMembershipBlips";

import {
  buildTopicResourceLinkRows,
  buildTopicRow,
  buildTopicTagRows,
} from "./topicRows";

const createSchema = {
  schema: {
    description: "Create a new topic",
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
        },
        description: nullableString,
        reason: nullableString,
        domainIds: {
          type: "array",
          items: {
            type: "string",
          },
        },
        tagIds: tagIdsArraySchema,
        resourceLinks: resourceLinksArraySchema,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/",
    createSchema,
    async function (request) {
      const body = request.body;
      const id = uuidv4();

      await db.insert(topics).values(buildTopicRow(body, id));

      const uniqueDomainIds = Array.from(new Set(body.domainIds ?? []));
      if (uniqueDomainIds.length > 0) {
        await syncDomainMembershipByTopic(id, uniqueDomainIds);
      }

      const tagRows = buildTopicTagRows(body.tagIds, id) ?? [];
      if (tagRows.length > 0) {
        await db.insert(topicsToTags).values(tagRows);
      }

      const linkRows = buildTopicResourceLinkRows(body.resourceLinks, id) ?? [];
      if (linkRows.length > 0) {
        await db.insert(topicsToResources).values(linkRows);
      }

      return {
        status: "ok",
        id,
      };
    },
  );
}
