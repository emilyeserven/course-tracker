import { dailies } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";

import { buildDailyRow, dailyBodySchema } from "./dailyRows";

import type { DailyBody } from "./dailyRows";

export default createUpsertHandler<DailyBody>({
  description: "Create or update a daily",
  table: dailies,
  bodySchema: dailyBodySchema,
  buildRow: buildDailyRow,
  updateableColumns: [
    "name",
    "location",
    "description",
    "completions",
    "courseProviderId",
    "resourceId",
    "moduleGroupId",
    "moduleId",
    "taskId",
    "status",
    "criteria",
  ],
  generateIdIfMissing: true,
  returnId: true,
});
