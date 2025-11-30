// eslint-disable-next-line import/no-unassigned-import
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion,no-undef
    url: process.env.DATABASE_URL!,
  },
});
