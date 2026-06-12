// Response shape for GET /api/settings. The raw Readwise token is never sent to
// the client — only whether one is configured plus a short masked hint.
export interface AppSettingsSummary {
  readwiseConfigured: boolean;
  readwiseKeyHint: string | null; // e.g. "…aB3x" (last 4 chars) or null
}

// Request body for PUT /api/settings. A null or empty key clears the value.
export interface AppSettingsUpdate {
  readwiseApiKey: string | null;
}
