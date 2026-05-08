import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance, FastifyReply } from "fastify";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { idParamSchema } from "./schemas";
import { syncJunctionTable } from "./syncJunctionTable";

type Row = Record<string, unknown>;

interface JunctionConfig<TBody> {
  table: PgTable;
  foreignKey: AnyPgColumn;
  /**
   * Return `undefined` to skip syncing this junction for this request
   * (leaves existing rows untouched). Return `[]` to clear all rows.
   */
  buildRows: (body: TBody, id: string) => Row[] | undefined;
}

interface UpsertHandlerOptions<TBody> {
  description: string;
  table: PgTable;
  /** JSON Schema for the request body (passed straight through to Fastify). */
  bodySchema: object;
  buildRow: (body: TBody, id: string) => Row;
  updateableColumns: readonly string[];
  junctions?: readonly JunctionConfig<TBody>[];
  /** When true, missing or empty `id` params get a fresh uuid. */
  generateIdIfMissing?: boolean;
  /** Return an error message string to abort with 400, or null to proceed. */
  validate?: (body: TBody) => string | null;
  /** When true, response includes the row's id. */
  returnId?: boolean;
}

export function createUpsertHandler<TBody = Record<string, unknown>>(
  options: UpsertHandlerOptions<TBody>,
) {
  const schema = {
    schema: {
      description: options.description,
      params: idParamSchema,
      body: options.bodySchema,
    },
  } as const;

  return async function (server: FastifyInstance) {
    const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

    fastify.put("/:id", schema, async function (request, reply: FastifyReply) {
      const params = request.params as { id: string };
      const body = request.body as TBody;

      if (options.validate) {
        const errorMessage = options.validate(body);
        if (errorMessage !== null) {
          reply.status(400);
          return {
            status: "error",
            message: errorMessage,
          };
        }
      }

      const id = params.id || (options.generateIdIfMissing ? uuidv4() : params.id);

      const row = options.buildRow(body, id);

      const setClause: Row = {};
      for (const col of options.updateableColumns) {
        setClause[col] = row[col];
      }

      await db
        .insert(options.table)
        .values(row as never)
        .onConflictDoUpdate({
          target: (options.table as unknown as { id: AnyPgColumn }).id,
          set: setClause,
        });

      for (const junction of options.junctions ?? []) {
        const rows = junction.buildRows(body, id);
        if (rows !== undefined) {
          await syncJunctionTable(
            junction.table,
            junction.foreignKey,
            id,
            rows,
          );
        }
      }

      if (options.returnId) {
        return {
          status: "ok",
          id,
        };
      }
      return {
        status: "ok",
      };
    });
  };
}
