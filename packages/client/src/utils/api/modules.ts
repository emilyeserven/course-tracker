import type { Module, ModuleGroup } from "@emstack/types";

import { createEntityClient } from "./client";

export const moduleGroupsApi = createEntityClient<ModuleGroup>(
  "module-groups",
  "module group",
);
export const modulesApi = createEntityClient<Module>("modules", "module");

export const fetchModuleGroups = moduleGroupsApi.list;
export const upsertModuleGroup = moduleGroupsApi.upsert;
export const createModuleGroup = moduleGroupsApi.create;
export const deleteSingleModuleGroup = moduleGroupsApi.delete;

export const fetchModules = modulesApi.list;
export const upsertModule = modulesApi.upsert;
export const createModule = modulesApi.create;
export const deleteSingleModule = modulesApi.delete;
