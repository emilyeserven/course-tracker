import { courseProviders } from "@/db/schema";
import { createCreateHandler } from "@/utils/createCreateHandler";

import { buildProviderRow, providerBodySchema } from "./providerRows";

import type { ProviderBody } from "./providerRows";

export default createCreateHandler<ProviderBody>({
  description: "Create a new provider",
  table: courseProviders,
  bodySchema: providerBodySchema,
  buildRow: buildProviderRow,
});
