import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { idParamSchema } from "./schemas";

interface JunctionRef {
  table: PgTable;
  foreignKey: AnyPgColumn;
}

interface DeleteHandlerOptions {
  description: string;
  table: PgTable;
  idColumn: AnyPgColumn;
  junctions?: JunctionRef[];
}

export function createDeleteHandler({
  description,
  table,
  idColumn,
  junctions = [],
}: DeleteHandlerOptions) {
  const schema = {
    schema: {
      description,
      params: idParamSchema,
    },
  } as const;

  return async function (server: FastifyInstance) {
    const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

    fastify.delete("/:id", schema, async function (request) {
      const {
        id,
      } = request.params;

      for (const junction of junctions) {
        await db.delete(junction.table).where(eq(junction.foreignKey, id));
      }
      await db.delete(table).where(eq(idColumn, id));

      return {
        status: "ok",
      };
    });
  };
}
