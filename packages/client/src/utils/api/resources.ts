import type {
  ModulesConfig,
  Resource,
  ResourceInResources,
  RoutineInteraction,
} from "@emstack/types";

import { createEntityClient, fetchJson, postJson, putJson } from "./client";

const resourcesApi = createEntityClient<Resource, ResourceInResources[]>(
  "resources",
  "resource",
);

export const fetchResources = resourcesApi.list;
export const fetchSingleResource = resourcesApi.get;
export const upsertResource = resourcesApi.upsert;
export const deleteSingleResource = resourcesApi.delete;
export const duplicateResource = resourcesApi.duplicate;

// Routine completions whose scheduled day-action touched this resource (directly
// or via a linked task). Derived server-side; read-only for the Interactions tab.
export async function fetchResourceRoutineInteractions(
  id: string,
): Promise<RoutineInteraction[]> {
  return fetchJson<RoutineInteraction[]>(
    `/api/resources/${id}/routine-interactions`,
  );
}

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
