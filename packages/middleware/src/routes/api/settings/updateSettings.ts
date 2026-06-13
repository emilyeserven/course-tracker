import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { nullableString } from "@/utils/schemas";

// The single settings row is keyed by this constant — there is no multi-user
// concept, so every write targets the same row.
const SETTINGS_ROW_ID = "global";

const updateSchema = {
  schema: {
    description: "Update application settings (e.g. the Readwise API key)",
    body: {
      type: "object",
      required: ["readwiseApiKey"],
      properties: {
        readwiseApiKey: nullableString,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.put(
    "/",
    updateSchema,
    async function (request) {
      // Treat a blank/whitespace key as "clear it".
      const trimmed = request.body.readwiseApiKey?.trim();
      const value = trimmed ? trimmed : null;

      await db
        .insert(appSettings)
        .values({
          id: SETTINGS_ROW_ID,
          readwiseApiKey: value,
        })
        .onConflictDoUpdate({
          target: appSettings.id,
          set: {
            readwiseApiKey: value,
          },
        });

      return {
        status: "ok",
      };
    },
  );
}
