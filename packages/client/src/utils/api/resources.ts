import type { Resource, ResourceInResources } from "@emstack/types";

import { createEntityClient, postJson } from "./client";

const resourcesApi = createEntityClient<Resource, ResourceInResources[]>(
  "resources",
  "resource",
);

export const fetchResources = resourcesApi.list;
export const fetchSingleResource = resourcesApi.get;
export const upsertResource = resourcesApi.upsert;
export const deleteSingleResource = resourcesApi.delete;
export const duplicateResource = resourcesApi.duplicate;

export async function incrementResourceProgress(
  id: string,
): Promise<{
  status: string;
  id: string;
  progressCurrent: number;
  progressTotal: number;
}> {
  return postJson(
    `/api/resources/${id}/incrementProgress`,
    undefined,
    "Failed to increment resource progress",
  );
}
