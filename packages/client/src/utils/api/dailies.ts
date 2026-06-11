import type { Daily } from "@emstack/types";

import { fetchJson } from "./client";
import { routinesApi } from "./routines";

// Dailies are now routines projected into the Daily shape. `projected=true`
// returns BOTH daily- and weekly-mode routines (each carrying its `mode`) so the
// tracker / dashboard list weekly routines too. These thin wrappers keep the
// existing daily tracker / dashboard / detail components working unchanged.
export const fetchDailies = () =>
  fetchJson<Daily[]>("/api/routines?projected=true");
export const fetchSingleDaily = (id: string) =>
  fetchJson<Daily>(`/api/routines/${id}`);
// No mode injection: the routines upsert merges partially, so an absent `mode`
// preserves the row's existing mode. This keeps completion edits safe on both
// daily- and weekly-mode routines (a weekly routine is never flipped to daily).
export const upsertDaily = routinesApi.upsert;
export const deleteSingleDaily = routinesApi.delete;
