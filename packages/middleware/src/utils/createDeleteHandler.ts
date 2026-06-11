import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq, sql } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { sendConflict } from "./errors";
import { idParamSchema } from "./schemas";

interface JunctionRef {
  table: PgTable;
  foreignKey: AnyPgColumn;
}

interface ReferenceGuard {
  /** Table whose rows may still reference the entity being deleted. */
  table: PgTable;
  /** Column on that table holding the entity's id. */
  column: AnyPgColumn;
  /** 409 message when `count` referencing rows exist. */
  message: (count: number) => string;
}

interface DeleteHandlerOptions {
  description: string;
  table: PgTable;
  idColumn: AnyPgColumn;
  junctions?: JunctionRef[];
  /** Refuse deletion with a 409 while referencing rows exist. */
  guard?: ReferenceGuard;
}

export function createDeleteHandler({
  description,
  table,
  idColumn,
  junctions = [],
  guard,
}: DeleteHandlerOptions) {
  const schema = {
    schema: {
      description,
      params: idParamSchema,
    },
  } as const;

  return async function (server: FastifyInstance) {
    const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

    fastify.delete("/:id", schema, async function (request, reply) {
      const {
        id,
      } = request.params;

      if (guard) {
        const [{
          count,
        }] = await db
          .select({
            count: sql<number>`count(*)::int`,
          })
          .from(guard.table)
          .where(eq(guard.column, id));
        if (count > 0) {
          return sendConflict(reply, guard.message(count));
        }
      }

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
