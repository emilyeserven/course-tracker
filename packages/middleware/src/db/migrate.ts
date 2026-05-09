import "dotenv/config";

import { runMigrations } from "./startup.ts";

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
