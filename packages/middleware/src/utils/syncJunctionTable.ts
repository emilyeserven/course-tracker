import { eq } from "drizzle-orm";
import { AnyPgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";

export async function syncJunctionTable<TTable extends PgTable>(
  table: TTable,
  parentColumn: AnyPgColumn,
  parentId: string,
  rows: TTable["$inferInsert"][],
) {
  await db.delete(table).where(eq(parentColumn, parentId));
  if (rows.length > 0) {
    await db.insert(table).values(rows);
  }
}
