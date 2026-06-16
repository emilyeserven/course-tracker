import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { findResourceOr404 } from "./findResourceOr404";
import { idParamSchema } from "./schemas";

interface ResourceFieldUpdateOptions {
  method: "POST" | "PUT";
  path: string;
  description: string;
  /** The resources column to write, and the request-body field to read it from. */
  field: string;
  /** JSON Schema for the request body (passed straight through to Fastify). */
  bodySchema: object;
}

// A surgical single-column update on a resource: validate it exists, write one
// column, and echo it back. Parallels createUpsertHandler but skips junctions and
// the full row, so the Modules tab can persist one field (modulesAreExhaustive /
// modulesConfig) without re-sending — and risking clobbering — the rest of the row.
export function createResourceFieldUpdateHandler(
  options: ResourceFieldUpdateOptions,
) {
  const schema = {
    description: options.description,
    params: idParamSchema,
    body: options.bodySchema,
  } as const;

  return async function (server: FastifyInstance) {
    const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

    fastify.route({
      method: options.method,
      url: options.path,
      schema,
      handler: async function (request, reply) {
        const {
          id,
        } = request.params as { id: string };
        const value = (request.body as Record<string, unknown>)[options.field];

        const resource = await findResourceOr404(reply, id);
        if (!resource) {
          return reply;
        }

        await db
          .update(resources)
          .set({
            [options.field]: value,
          } as never)
          .where(eq(resources.id, id));

        return {
          status: "ok",
          id,
          [options.field]: value,
        };
      },
    });
  };
}
