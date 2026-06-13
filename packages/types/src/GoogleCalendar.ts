// Projection of a calendar event, returned by GET /api/google-calendar/events.
// The middleware expands each subscribed iCal feed into this shape so the client
// never sees the raw ICS. Events are aggregated across all subscribed feeds.
export interface GoogleCalendarEvent {
  id: string;
  // Id of the feed this event came from.
  calendarId: string;
  // Human-readable name of the source feed, for display/grouping.
  calendarName: string;
  // The feed's colour (hex), or null — used for the per-feed dot.
  calendarColor: string | null;
  summary: string;
  // ISO 8601 start/end. All-day events carry a date-only string ("2026-06-13");
  // timed events carry a full datetime ("2026-06-13T09:00:00Z").
  start: string;
  end: string;
  // True for all-day events.
  allDay: boolean;
  location: string | null;
  // Deep link to the event, when the feed provides one.
  htmlLink: string;
}

export interface GoogleCalendarEvents {
  // false when no calendar feeds are subscribed yet — lets the dashboard card
  // prompt the user to add one instead of surfacing an error. When feeds exist
  // but nothing is upcoming, `events` is simply empty.
  configured: boolean;
  events: GoogleCalendarEvent[];
}

// A subscribed iCal feed, persisted in app settings. The secret URL is the
// credential and is never sent back to the client (see CalendarFeedSummary).
export interface CalendarFeed {
  id: string;
  url: string;
  name: string;
  color?: string;
}

// What the Settings UI sees for each feed — the secret URL is masked to a hint.
export interface CalendarFeedSummary {
  id: string;
  name: string;
  urlHint: string;
  color: string | null;
}
