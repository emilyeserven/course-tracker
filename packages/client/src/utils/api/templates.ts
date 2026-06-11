import type { DailyCriteriaTemplate, RoutineTemplate } from "@emstack/types";

import { createEntityClient } from "./client";

export const dailyCriteriaTemplatesApi = createEntityClient<DailyCriteriaTemplate>(
  "daily-criteria-templates",
  "criteria template",
);
export const routineTemplatesApi = createEntityClient<RoutineTemplate>(
  "routine-templates",
  "routine template",
);

export const fetchDailyCriteriaTemplates = dailyCriteriaTemplatesApi.list;
export const upsertDailyCriteriaTemplate = dailyCriteriaTemplatesApi.upsert;
export const createDailyCriteriaTemplate = dailyCriteriaTemplatesApi.create;
export const deleteSingleDailyCriteriaTemplate = dailyCriteriaTemplatesApi.delete;

export const fetchRoutineTemplates = routineTemplatesApi.list;
export const upsertRoutineTemplate = routineTemplatesApi.upsert;
export const createRoutineTemplate = routineTemplatesApi.create;
export const deleteSingleRoutineTemplate = routineTemplatesApi.delete;
