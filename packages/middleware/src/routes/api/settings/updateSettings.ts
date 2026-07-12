import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { nullableString } from "@/utils/schemas";

// The single settings row is keyed by this constant — there is no multi-user
// concept, so every write targets the same row.
const SETTINGS_ROW_ID = "global";

// "page" (underlying link) or "bookmark" (Simple Bookmarks page); null clears
// back to the "page" default.
const nullableBookmarkClickTargetEnum = {
  type: ["string", "null"],
  enum: ["page", "bookmark", null],
} as const;

const updateSchema = {
  schema: {
    description: "Update application settings (e.g. the Readwise or Todoist API keys)",
    body: {
      type: "object",
      properties: {
        readwiseApiKey: nullableString,
        todoistApiKey: nullableString,
        bookmarkApiUrl: nullableString,
        bookmarkClickTarget: nullableBookmarkClickTargetEnum,
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
      if (request.body.bookmarkApiUrl !== undefined) {
        updates.bookmarkApiUrl = normalizeKey(request.body.bookmarkApiUrl);
      }
      if (request.body.bookmarkClickTarget !== undefined) {
        // A blank/null choice clears back to the "page" default.
        updates.bookmarkClickTarget = request.body.bookmarkClickTarget ?? "page";
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
