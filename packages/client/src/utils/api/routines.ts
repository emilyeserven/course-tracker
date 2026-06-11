import type { Routine } from "@emstack/types";

import { createEntityClient } from "./client";

export const routinesApi = createEntityClient<Routine>("routines", "routine");

export const fetchRoutines = routinesApi.list;
export const fetchSingleRoutine = routinesApi.get;
export const upsertRoutine = routinesApi.upsert;
export const createRoutine = routinesApi.create;
export const deleteSingleRoutine = routinesApi.delete;
export const duplicateRoutine = routinesApi.duplicate;
