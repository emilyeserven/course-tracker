import type { CreateResponse, SuccessObj } from "./client";
import type {
  CalendarFeedSummary,
  GoogleCalendarEvents,
} from "@emstack/types";

import { deleteJson, fetchJson, postJson } from "./client";

// Upcoming events merged across all subscribed feeds (for the dashboard card).
export function fetchGoogleCalendarEvents(): Promise<GoogleCalendarEvents> {
  return fetchJson<GoogleCalendarEvents>("/api/google-calendar/events");
}

// Subscribed feeds, secret URLs masked (for the Settings list).
export function fetchCalendarFeeds(): Promise<CalendarFeedSummary[]> {
  return fetchJson<CalendarFeedSummary[]>("/api/google-calendar/feeds");
}

export function addCalendarFeed(input: {
  url: string;
  name: string;
  color?: string;
}): Promise<CreateResponse> {
  return postJson<CreateResponse>(
    "/api/google-calendar/feeds",
    input,
    "Failed to add calendar feed",
  );
}

export function removeCalendarFeed(id: string): Promise<SuccessObj> {
  return deleteJson<SuccessObj>(
    `/api/google-calendar/feeds/${id}`,
    "Failed to remove calendar feed",
  );
}
