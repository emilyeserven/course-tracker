import type { Interaction } from "@emstack/types";

import { createEntityClient } from "./client";

const interactionsApi = createEntityClient<Interaction>(
  "interactions",
  "interaction",
);

export const fetchInteractions = interactionsApi.list;
export const upsertInteraction = interactionsApi.upsert;
export const createInteraction = interactionsApi.create;
export const deleteSingleInteraction = interactionsApi.delete;
