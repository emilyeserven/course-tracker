import "dotenv/config";
import * as schema from "@/db/schema";
import { drizzle as LocalDrizzle } from "drizzle-orm/node-postgres";

export const db = LocalDrizzle(process.env.DATABASE_URL!, {
  schema,
});
