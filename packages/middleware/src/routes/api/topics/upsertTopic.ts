import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { topics, topicsToResources, topicsToTags } from "@/db/schema";
import {
  idParamSchema,
  nullableString,
  resourceLinksArraySchema,
  tagIdsArraySchema,
} from "@/utils/schemas";
import { syncDomainMembershipByTopic } from "@/utils/syncMembershipBlips";
import { v4 as uuidv4 } from "uuid";

const upsertSchema = {
  schema: {
    description: "Update a topic",
    params: idParamSchema,
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

  fastify.put(
    "/:id",
    upsertSchema,
    async function (request) {
      const {
        id,
      } = request.params;
      const body = request.body;

      const row = {
        id,
        name: body.name,
        description: body.description ?? null,
        reason: body.reason ?? null,
      };

      await db
        .insert(topics)
        .values(row)
        .onConflictDoUpdate({
          target: topics.id,
          set: {
            name: row.name,
            description: row.description,
            reason: row.reason,
          },
        });

      if (body.domainIds !== undefined) {
        await syncDomainMembershipByTopic(
          id,
          Array.from(new Set(body.domainIds)),
        );
      }

      if (body.tagIds !== undefined) {
        await db.delete(topicsToTags).where(eq(topicsToTags.topicId, id));
        const uniqueTagIds = Array.from(new Set(body.tagIds));
        if (uniqueTagIds.length > 0) {
          await db.insert(topicsToTags).values(
            uniqueTagIds.map((tagId, index) => ({
              topicId: id,
              tagId,
              position: index,
            })),
          );
        }
      }

      if (body.resourceLinks !== undefined) {
        await db
          .delete(topicsToResources)
          .where(eq(topicsToResources.topicId, id));
        // Dedupe by the full (resourceId, moduleGroupId, moduleId) tuple so
        // a topic can hold multiple sub-target rows per resource.
        const seen = new Set<string>();
        const rows: {
          id: string;
          topicId: string;
          resourceId: string;
          moduleGroupId: string | null;
          moduleId: string | null;
        }[] = [];
        for (const link of body.resourceLinks) {
          const key = `${link.resourceId}|${link.moduleGroupId ?? ""}|${link.moduleId ?? ""}`;
          if (seen.has(key)) continue;
          seen.add(key);
          rows.push({
            id: uuidv4(),
            topicId: id,
            resourceId: link.resourceId,
            moduleGroupId: link.moduleGroupId ?? null,
            moduleId: link.moduleId ?? null,
          });
        }
        if (rows.length > 0) {
          await db.insert(topicsToResources).values(rows);
        }
      }

      return {
        status: "ok",
      };
    },
  );
}
