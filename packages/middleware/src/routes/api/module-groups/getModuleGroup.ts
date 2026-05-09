import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type { ModuleGroup } from "@emstack/types";
import { db } from "@/db";
import { idParamSchema } from "@/utils/schemas";
import { sendNotFound } from "@/utils/errors";

const getSchema = {
  schema: {
    description: "Get a single module group by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/:id", getSchema, async function (request, reply) {
    const {
      id,
    } = request.params;
    const moduleGroup = await db.query.moduleGroups.findFirst({
      where: (g, {
        eq,
      }) => eq(g.id, id),
      with: {
        modules: {
          orderBy: (m, {
            asc,
          }) => [asc(m.position), asc(m.name)],
        },
        moduleGroupTags: {
          with: {
            tag: true,
          },
          orderBy: (j, {
            asc,
          }) => asc(j.position),
        },
      },
    });

    if (!moduleGroup) {
      return sendNotFound(reply, "module group");
    }

    const result: ModuleGroup = {
      id: moduleGroup.id,
      resourceId: moduleGroup.resourceId,
      name: moduleGroup.name,
      description: moduleGroup.description,
      url: moduleGroup.url,
      position: moduleGroup.position,
      totalCount: moduleGroup.totalCount,
      completedCount: moduleGroup.completedCount,
      modules: moduleGroup.modules,
      easeOfStarting: moduleGroup.easeOfStarting ?? null,
      timeNeeded: moduleGroup.timeNeeded ?? null,
      interactivity: moduleGroup.interactivity ?? null,
      tags: (moduleGroup.moduleGroupTags ?? []).map(j => j.tag),
    };
    return result;
  });
}
