import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance, FastifyReply } from "fastify";
import { PgTable } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { sendBadRequest } from "./errors";

type Row = Record<string, unknown>;

interface CreateJunctionConfig<TBody> {
  table: PgTable;
  /** Return `undefined` or `[]` to insert nothing for a fresh entity. */
  buildRows: (body: TBody, id: string) => Row[] | undefined;
}

interface CreateHandlerOptions<TBody> {
  description: string;
  table: PgTable;
  /** JSON Schema for the request body (passed straight through to Fastify). */
  bodySchema: object;
  buildRow: (body: TBody, id: string) => Row;
  junctions?: readonly CreateJunctionConfig<TBody>[];
  /**
   * Async pre-write transform of the request body, run after `validate` and
   * before `buildRow` (mirrors createUpsertHandler). Use for db-backed
   * enrichment that needs the freshly-generated id.
   */
  prepareBody?: (body: TBody, id: string) => Promise<TBody>;
  /** Runs after the row and junctions are written (cross-table side effects). */
  afterCreate?: (body: TBody, id: string) => Promise<void>;
  /** Return an error message string to abort with 400, or null to proceed. */
  validate?: (body: TBody) => string | null;
}

/**
 * POST `/` counterpart to createUpsertHandler: generates a fresh uuid, inserts
 * the row and any junction rows, and responds `{ status: "ok", id }`. Share
 * the bodySchema and row builders with the entity's upsert handler (see
 * `topics/topicRows.ts`).
 */
export function createCreateHandler<TBody = Record<string, unknown>>(
  options: CreateHandlerOptions<TBody>,
) {
  const schema = {
    schema: {
      description: options.description,
      body: options.bodySchema,
    },
  } as const;

  return async function (server: FastifyInstance) {
    const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

    fastify.post("/", schema, async function (request, reply: FastifyReply) {
      const rawBody = request.body as TBody;

      if (options.validate) {
        const errorMessage = options.validate(rawBody);
        if (errorMessage !== null) {
          return sendBadRequest(reply, errorMessage);
        }
      }

      const id = uuidv4();

      const body = options.prepareBody
        ? await options.prepareBody(rawBody, id)
        : rawBody;

      await db.insert(options.table).values(options.buildRow(body, id) as never);

      for (const junction of options.junctions ?? []) {
        const rows = junction.buildRows(body, id) ?? [];
        if (rows.length > 0) {
          await db.insert(junction.table).values(rows as never[]);
        }
      }

      if (options.afterCreate) {
        await options.afterCreate(body, id);
      }

      return {
        status: "ok",
        id,
      };
    });
  };
}
