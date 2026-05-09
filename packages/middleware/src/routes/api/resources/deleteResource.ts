import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  interactions,
  moduleGroups,
  moduleGroupTags,
  modules,
  moduleTags,
  resources,
  resourceTags,
  tasksToResources,
  topicsToResources,
} from "@/db/schema";
import { idParamSchema } from "@/utils/schemas";

const schema = {
  schema: {
    description: "Delete a course by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.delete("/:id", schema, async function (request) {
    const {
      id,
    } = request.params;

    await db.delete(topicsToResources).where(eq(topicsToResources.resourceId, id));
    await db.delete(tasksToResources).where(eq(tasksToResources.resourceId, id));
    await db.delete(resourceTags).where(eq(resourceTags.resourceId, id));
    // Interactions reference resources + (optionally) modules / moduleGroups.
    // Delete them before the modules cascade so the FK ON DELETE SET NULL
    // doesn't have to do extra work.
    await db.delete(interactions).where(eq(interactions.resourceId, id));

    // Module-tag rows reference modules.id, so drop them before the modules.
    const moduleIds = (
      await db
        .select({
          id: modules.id,
        })
        .from(modules)
        .where(eq(modules.resourceId, id))
    ).map(m => m.id);
    if (moduleIds.length > 0) {
      await db.delete(moduleTags).where(inArray(moduleTags.moduleId, moduleIds));
    }
    await db.delete(modules).where(eq(modules.resourceId, id));

    // Same idea for module-group tags before module groups.
    const groupIds = (
      await db
        .select({
          id: moduleGroups.id,
        })
        .from(moduleGroups)
        .where(eq(moduleGroups.resourceId, id))
    ).map(g => g.id);
    if (groupIds.length > 0) {
      await db
        .delete(moduleGroupTags)
        .where(inArray(moduleGroupTags.moduleGroupId, groupIds));
    }
    await db.delete(moduleGroups).where(eq(moduleGroups.resourceId, id));

    await db.delete(resources).where(eq(resources.id, id));

    return {
      status: "ok",
    };
  });
}
