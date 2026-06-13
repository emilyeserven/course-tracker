// The maximum number of domains that can be marked "Focused" at once. Focused
// domains sort to the top of the Domains page and get their own tab in the
// "Explore Something" dashboard card.
export const MAX_FOCUSED_DOMAINS = 3;

// Response shape for GET /api/settings. Raw API tokens are never sent to the
// client — only whether each integration is configured plus a short masked hint.
export interface AppSettingsSummary {
  readwiseConfigured: boolean;
  readwiseKeyHint: string | null; // e.g. "…aB3x" (last 4 chars) or null
  todoistConfigured: boolean;
  todoistKeyHint: string | null; // e.g. "…aB3x" (last 4 chars) or null
  // Google Calendar uses OAuth rather than an API key: `configured` reflects
  // whether tokens are stored, the email identifies the connected account, and
  // the selected ids are the calendars feeding the dashboard card.
  googleCalendarConfigured: boolean;
  googleAccountEmail: string | null;
  googleSelectedCalendarIds: string[];
  // Ordered ids of the domains marked "Focused" (capped at MAX_FOCUSED_DOMAINS).
  focusedDomainIds: string[];
}

// Request body for PUT /api/settings. Only the keys present in the body are
// updated; a null or empty value clears that key.
export interface AppSettingsUpdate {
  readwiseApiKey?: string | null;
  todoistApiKey?: string | null;
  // Replaces the set of calendars whose events feed the dashboard card. The
  // Google OAuth tokens themselves are set by the connect/callback flow, not
  // here.
  googleSelectedCalendarIds?: string[];
  // Replaces the focused-domain selection wholesale. Order is preserved and the
  // server caps the list at MAX_FOCUSED_DOMAINS.
  focusedDomainIds?: string[];
}
