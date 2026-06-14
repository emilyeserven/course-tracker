import type { ModulesConfig, Resource, ResourceInResources } from "@emstack/types";

import { createEntityClient, postJson, putJson } from "./client";

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

export async function updateResourceModulesConfig(
  id: string,
  modulesConfig: ModulesConfig,
): Promise<{
  status: string;
  id: string;
  modulesConfig: ModulesConfig;
}> {
  return putJson(
    `/api/resources/${id}/modulesConfig`,
    {
      modulesConfig,
    },
    "Failed to update naming conventions",
  );
}

export async function setResourceModulesExhaustive(
  id: string,
  modulesAreExhaustive: boolean,
): Promise<{
  status: string;
  id: string;
  modulesAreExhaustive: boolean;
}> {
  return postJson(
    `/api/resources/${id}/modulesExhaustive`,
    {
      modulesAreExhaustive,
    },
    "Failed to update module-list setting",
  );
}
