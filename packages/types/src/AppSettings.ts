// Response shape for GET /api/settings. Raw API tokens are never sent to the
// client — only whether each integration is configured plus a short masked hint.
export interface AppSettingsSummary {
  readwiseConfigured: boolean;
  readwiseKeyHint: string | null; // e.g. "…aB3x" (last 4 chars) or null
  todoistConfigured: boolean;
  todoistKeyHint: string | null; // e.g. "…aB3x" (last 4 chars) or null
}

// Request body for PUT /api/settings. Only the keys present in the body are
// updated; a null or empty value clears that key.
export interface AppSettingsUpdate {
  readwiseApiKey?: string | null;
  todoistApiKey?: string | null;
}
