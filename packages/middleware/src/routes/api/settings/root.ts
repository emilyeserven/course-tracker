import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type { AppSettingsSummary } from "@emstack/types";
import { db } from "@/db";
import { appSettings } from "@/db/schema";

// Build a short, non-reversible hint so the UI can confirm a key is saved
// without ever exposing the secret itself.
function maskKey(key: string | null | undefined): string | null {
  if (!key) return null;
  return `…${key.slice(-4)}`;
}

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/",
    async (): Promise<AppSettingsSummary> => {
      const [row] = await db.select().from(appSettings).limit(1);
      const readwiseKey = row?.readwiseApiKey ?? null;
      const todoistKey = row?.todoistApiKey ?? null;
      return {
        readwiseConfigured: Boolean(readwiseKey),
        readwiseKeyHint: maskKey(readwiseKey),
        todoistConfigured: Boolean(todoistKey),
        todoistKeyHint: maskKey(todoistKey),
        focusedDomainIds: row?.focusedDomainIds ?? [],
      };
    },
  );
}
