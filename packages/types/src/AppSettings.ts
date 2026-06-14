import type { HintTemplate } from "./HintTemplate";

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
  // Ordered ids of the domains marked "Focused" (capped at MAX_FOCUSED_DOMAINS).
  focusedDomainIds: string[];
  // Reusable hint templates for naming a resource's group/module hierarchy.
  moduleHintTemplates: HintTemplate[];
}

// Request body for PUT /api/settings. Only the keys present in the body are
// updated; a null or empty value clears that key.
export interface AppSettingsUpdate {
  readwiseApiKey?: string | null;
  todoistApiKey?: string | null;
  // Replaces the focused-domain selection wholesale. Order is preserved and the
  // server caps the list at MAX_FOCUSED_DOMAINS.
  focusedDomainIds?: string[];
  // Replaces the saved hint templates wholesale when present.
  moduleHintTemplates?: HintTemplate[];
}
