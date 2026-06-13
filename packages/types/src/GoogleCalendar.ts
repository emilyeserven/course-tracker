// Projection of a Google Calendar event, returned by
// GET /api/google-calendar/events. The middleware maps the raw Calendar API v3
// event onto this shape so the client never sees the full payload. Events are
// aggregated across all of the user's selected calendars.
export interface GoogleCalendarEvent {
  id: string;
  // Id of the calendar this event belongs to.
  calendarId: string;
  // Human-readable name of the source calendar, for display/grouping.
  calendarName: string;
  // The source calendar's colour (hex), or null — used for the per-calendar dot.
  calendarColor: string | null;
  summary: string;
  // ISO 8601 start/end. All-day events carry a date-only string ("2026-06-13");
  // timed events carry a full datetime ("2026-06-13T09:00:00Z").
  start: string;
  end: string;
  // True for all-day events (Google returns `date` rather than `dateTime`).
  allDay: boolean;
  location: string | null;
  // Deep link to the event in Google Calendar.
  htmlLink: string;
}

// One entry from the user's calendar list, offered as a checkbox in Settings so
// they can choose which calendars feed the dashboard card.
export interface GoogleCalendarListEntry {
  id: string;
  summary: string;
  backgroundColor: string | null;
  primary: boolean;
}

export interface GoogleCalendarEvents {
  // false when Google Calendar isn't connected yet — lets the dashboard card
  // prompt the user to connect instead of surfacing an error. When connected but
  // no calendars are selected (or nothing is upcoming), `events` is simply empty.
  configured: boolean;
  events: GoogleCalendarEvent[];
}
