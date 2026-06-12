import { courseProviders } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";

import { buildProviderRow, providerBodySchema } from "./providerRows";

import type { ProviderBody } from "./providerRows";

export default createUpsertHandler<ProviderBody>({
  description: "Create or update a provider",
  table: courseProviders,
  bodySchema: providerBodySchema,
  buildRow: buildProviderRow,
  updateableColumns: [
    "name",
    "description",
    "url",
    "cost",
    "isRecurring",
    "recurDate",
    "recurPeriodUnit",
    "recurPeriod",
    "isCourseFeesShared",
  ],
});
