import type { CourseProvider } from "@emstack/types";

import { createEntityClient } from "./client";

export const providersApi = createEntityClient<CourseProvider>(
  "providers",
  "provider",
);

export const fetchProviders = providersApi.list;
export const fetchSingleProvider = providersApi.get;
export const upsertProvider = providersApi.upsert;
export const createProvider = providersApi.create;
export const deleteSinglePlatform = providersApi.delete;
