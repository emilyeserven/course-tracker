import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { MAX_FOCUSED_DOMAINS } from "@emstack/types";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { nullableString } from "@/utils/schemas";

// The single settings row is keyed by this constant — there is no multi-user
// concept, so every write targets the same row.
const SETTINGS_ROW_ID = "global";

const updateSchema = {
  schema: {
    description: "Update application settings (e.g. the Readwise or Todoist API keys)",
    body: {
      type: "object",
      properties: {
        readwiseApiKey: nullableString,
        todoistApiKey: nullableString,
        focusedDomainIds: {
          type: "array",
          items: {
            type: "string",
          },
        },
        moduleHintTemplates: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "name", "groupHint", "moduleHint"],
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
              groupHint: {
                type: "string",
              },
              moduleHint: {
                type: "string",
              },
            },
            additionalProperties: false,
          },
        },
      },
    },
  },
} as const;

// Treat a blank/whitespace key as "clear it".
function normalizeKey(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/",
    updateSchema,
    async function (request) {
      // Only touch the columns the request actually included, so updating one
      // integration's key never clobbers another's.
      const updates: Partial<typeof appSettings.$inferInsert> = {};
      if (request.body.readwiseApiKey !== undefined) {
        updates.readwiseApiKey = normalizeKey(request.body.readwiseApiKey);
      }
      if (request.body.todoistApiKey !== undefined) {
        updates.todoistApiKey = normalizeKey(request.body.todoistApiKey);
      }
      if (request.body.focusedDomainIds !== undefined) {
        // Dedupe while preserving order, then enforce the focus cap server-side
        // so the limit holds regardless of the client.
        const deduped = [...new Set(request.body.focusedDomainIds)];
        updates.focusedDomainIds = deduped.slice(0, MAX_FOCUSED_DOMAINS);
      }
      if (request.body.moduleHintTemplates !== undefined) {
        // Replaces the saved hint templates wholesale.
        updates.moduleHintTemplates = request.body.moduleHintTemplates;
      }

      if (Object.keys(updates).length > 0) {
        await db
          .insert(appSettings)
          .values({
            id: SETTINGS_ROW_ID,
            ...updates,
          })
          .onConflictDoUpdate({
            target: appSettings.id,
            set: updates,
          });
      }

      return {
        status: "ok",
      };
    },
  );
}
