import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { moduleGroups, modules } from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";

const schema = {
  schema: {
    description:
      "Delete a module group. Member modules survive (their moduleGroupId becomes null).",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete("/:id", schema, async function (request) {
    const { id } = request.params;

    // Orphan member modules up to the course level rather than cascading.
    await db
      .update(modules)
      .set({
        moduleGroupId: null,
      })
      .where(eq(modules.moduleGroupId, id));

    await db.delete(moduleGroups).where(eq(moduleGroups.id, id));

    return {
      status: "ok",
    };
  });
}
