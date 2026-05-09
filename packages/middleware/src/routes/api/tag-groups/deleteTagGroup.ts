import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { tagGroups, tags } from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";
import { sendConflict } from "@/utils/errors";

const schema = {
  schema: {
    description: "Delete a tag group by ID (only if it has no tags)",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete("/:id", schema, async function (request, reply) {
    const { id } = request.params;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tags)
      .where(eq(tags.groupId, id));

    if (count > 0) {
      return sendConflict(
        reply,
        `Cannot delete tag group: ${count} tag${count === 1 ? "" : "s"} still belong to it`,
      );
    }

    await db.delete(tagGroups).where(eq(tagGroups.id, id));
    return { status: "ok" };
  });
}
