import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle as LocalDrizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { usersTable } from "@/db/schema.ts";
import { neon } from "@neondatabase/serverless";
import { drizzle as NeonDrizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

let db:
  | NeonHttpDatabase<Record<string, never>>
  | NodePgDatabase<Record<string, never>>;
if (process.env.NODE_ENV === "production") {
  const sql = neon(process.env.DATABASE_URL!);
  db = NeonDrizzle({
    client: sql,
  });
}
else {
  db = LocalDrizzle(process.env.DATABASE_URL!);
}

async function main() {
  const user: typeof usersTable.$inferInsert = {
    name: "John",
    age: 30,
    email: "john@example.com",
  };

  await db.insert(usersTable).values(user)
    .onConflictDoNothing();
  console.log("New user created!");

  const users = await db.select().from(usersTable);
  console.log("Getting all users from the database: ", users);

  await db.update(usersTable).set({
    age: 31,
  }).where(eq(usersTable.email, user.email));
  console.log("User info updated!");
}

main();

export { db };
