import type { SuccessObj } from "./client";
import type {
  GoogleCalendarEvents,
  GoogleCalendarListEntry,
} from "@emstack/types";

import { fetchJson, postJson } from "./client";

// Upcoming events across the user's selected calendars (for the dashboard card).
export function fetchGoogleCalendarEvents(): Promise<GoogleCalendarEvents> {
  return fetchJson<GoogleCalendarEvents>("/api/google-calendar/events");
}

// The connected account's calendars (for the Settings checkbox list).
export function fetchGoogleCalendars(): Promise<GoogleCalendarListEntry[]> {
  return fetchJson<GoogleCalendarListEntry[]>("/api/google-calendar/calendars");
}

export function disconnectGoogleCalendar(): Promise<SuccessObj> {
  return postJson<SuccessObj>(
    "/api/google-calendar/disconnect",
    undefined,
    "Failed to disconnect Google Calendar",
  );
}

// Connecting is a full-page OAuth redirect, not an XHR — navigate the browser
// here (window.location) so Google's consent screen can take over.
export const GOOGLE_CALENDAR_CONNECT_URL = "/api/google-calendar/connect";
