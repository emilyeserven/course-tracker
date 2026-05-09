import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type { Module } from "@emstack/types";
import { db } from "@/db";
import { idParamSchema } from "@/utils/schemas";
import { sendNotFound } from "@/utils/errors";

const getSchema = {
  schema: {
    description: "Get a single module by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/:id", getSchema, async function (request, reply) {
    const {
      id,
    } = request.params;
    const module_ = await db.query.modules.findFirst({
      where: (m, {
        eq,
      }) => eq(m.id, id),
      with: {
        moduleTags: {
          with: {
            tag: true,
          },
          orderBy: (j, {
            asc,
          }) => asc(j.position),
        },
      },
    });

    if (!module_) {
      return sendNotFound(reply, "module");
    }

    const result: Module = {
      id: module_.id,
      resourceId: module_.resourceId,
      moduleGroupId: module_.moduleGroupId,
      name: module_.name,
      description: module_.description,
      url: module_.url,
      length: module_.length,
      minutesLength: module_.minutesLength,
      isComplete: module_.isComplete,
      position: module_.position,
      easeOfStarting: module_.easeOfStarting ?? null,
      timeNeeded: module_.timeNeeded ?? null,
      interactivity: module_.interactivity ?? null,
      tags: (module_.moduleTags ?? []).map(j => j.tag),
    };
    return result;
  });
}
