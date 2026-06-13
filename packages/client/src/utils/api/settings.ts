import type { SuccessObj } from "./client";
import type { AppSettingsSummary, AppSettingsUpdate } from "@emstack/types";

import { fetchJson, putJson } from "./client";

// Single-row app settings — not a CRUD entity, so it uses the raw JSON helpers
// rather than createEntityClient.
export function fetchSettings(): Promise<AppSettingsSummary> {
  return fetchJson<AppSettingsSummary>("/api/settings");
}

export function updateSettings(data: AppSettingsUpdate): Promise<SuccessObj> {
  return putJson<SuccessObj>("/api/settings", data, "Failed to save settings");
}
