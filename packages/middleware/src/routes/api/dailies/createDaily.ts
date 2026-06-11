import { dailies } from "@/db/schema";
import { createCreateHandler } from "@/utils/createCreateHandler";

import { buildDailyRow, dailyBodySchema } from "./dailyRows";

import type { DailyBody } from "./dailyRows";

export default createCreateHandler<DailyBody>({
  description: "Create a new daily",
  table: dailies,
  bodySchema: dailyBodySchema,
  buildRow: buildDailyRow,
});
