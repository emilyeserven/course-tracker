import type { Routine } from "@emstack/types";

import { createEntityClient, postJson } from "./client";

export const routinesApi = createEntityClient<Routine>("routines", "routine");

export const fetchRoutines = routinesApi.list;
export const fetchSingleRoutine = routinesApi.get;
export const upsertRoutine = routinesApi.upsert;
export const createRoutine = routinesApi.create;
export const deleteSingleRoutine = routinesApi.delete;
export const duplicateRoutine = routinesApi.duplicate;

// Convert a curated routine into a Task List: each dated entry becomes a todo,
// then the routine is archived. Returns the new task id.
export async function convertRoutineToTaskList(
  id: string,
): Promise<{ id: string }> {
  return postJson(
    `/api/routines/${id}/convert-to-task-list`,
    undefined,
    "Failed to convert routine to a Task List",
  );
}
