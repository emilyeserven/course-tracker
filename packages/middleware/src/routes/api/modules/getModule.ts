import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import { sendNotFound } from "@/utils/errors";
import { mapModule } from "@/utils/moduleProjection";
import { idParamSchema } from "@/utils/schemas";

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

    return mapModule(module_);
  });
}
