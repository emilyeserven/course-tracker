import { randomUUID } from "node:crypto";

import type {
  CalendarFeed,
  CalendarFeedSummary,
  GoogleCalendarEvent,
} from "@emstack/types";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import {
  expandIcsToEvents,
  mergeAndSortEvents,
} from "@/services/googleCalendarIcs";
import { assertSafeOutboundUrl } from "@/utils/safeOutboundUrl";

// How far ahead the dashboard agenda looks.
const DAYS_AHEAD = 14;

// The single settings row id — there is no multi-user concept (see settings.ts).
const SETTINGS_ROW_ID = "global";

/** Error carrying an HTTP status so the route can map it to a friendly reply. */
export class GoogleCalendarError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "GoogleCalendarError";
    this.statusCode = statusCode;
  }
}

/** The subscribed iCal feeds, in saved order. */
export async function getCalendarFeeds(): Promise<CalendarFeed[]> {
  const [row] = await db.select().from(appSettings).limit(1);
  return row?.googleCalendarFeeds ?? [];
}

/** Mask a secret feed URL down to a recognisable hint (host + tail). */
function maskUrl(url: string): string {
  try {
    const {
      host,
    } = new URL(url);
    return `${host}/…${url.slice(-4)}`;
  }
  catch {
    return `…${url.slice(-4)}`;
  }
}

/** Client-facing view of the feeds — the secret URL is never exposed. */
export async function getCalendarFeedSummaries(): Promise<CalendarFeedSummary[]> {
  const feeds = await getCalendarFeeds();
  return feeds.map(feed => ({
    id: feed.id,
    name: feed.name,
    urlHint: maskUrl(feed.url),
    color: feed.color ?? null,
  }));
}

async function saveFeeds(feeds: CalendarFeed[]): Promise<void> {
  await db
    .insert(appSettings)
    .values({
      id: SETTINGS_ROW_ID,
      googleCalendarFeeds: feeds,
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        googleCalendarFeeds: feeds,
      },
    });
}

/** Fetch a feed's raw ICS text, mapping failures to a GoogleCalendarError. */
async function fetchIcsText(url: string): Promise<string> {
  // SSRF gate: validate the destination before any network call.
  try {
    assertSafeOutboundUrl(url);
  }
  catch {
    throw new GoogleCalendarError("Invalid or disallowed feed URL.", 400);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "text/calendar",
      },
    });
  }
  catch {
    throw new GoogleCalendarError("Could not reach the calendar feed.", 502);
  }
  if (!response.ok) {
    throw new GoogleCalendarError(
      `Calendar feed request failed (${response.status}).`,
      502,
    );
  }
  return response.text();
}

/**
 * Validate that a URL serves iCal data and add it as a feed. Fetching here gives
 * the user immediate feedback on a bad URL. Returns the new feed's id.
 */
export async function addCalendarFeed(input: {
  url: string;
  name: string;
  color?: string;
}): Promise<string> {
  const text = await fetchIcsText(input.url);
  if (!text.includes("BEGIN:VCALENDAR")) {
    throw new GoogleCalendarError(
      "That URL doesn't look like an iCal feed.",
      400,
    );
  }

  const feed: CalendarFeed = {
    id: randomUUID(),
    url: input.url.trim(),
    name: input.name.trim() || "Calendar",
    ...(input.color
      ? {
        color: input.color,
      }
      : {}),
  };

  const feeds = await getCalendarFeeds();
  await saveFeeds([...feeds, feed]);
  return feed.id;
}

/** Remove a feed by id. */
export async function removeCalendarFeed(id: string): Promise<void> {
  const feeds = await getCalendarFeeds();
  await saveFeeds(feeds.filter(feed => feed.id !== id));
}

/**
 * Fetch upcoming events across all subscribed feeds, merged and sorted. Feeds
 * are fetched sequentially (there are only a handful).
 */
export async function fetchUpcomingEvents(
  feeds: CalendarFeed[],
): Promise<GoogleCalendarEvent[]> {
  if (feeds.length === 0) return [];

  const from = new Date();
  const to = new Date(from.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

  const collected: GoogleCalendarEvent[] = [];
  for (const feed of feeds) {
    const text = await fetchIcsText(feed.url);
    collected.push(
      ...expandIcsToEvents(text, from, to, {
        id: feed.id,
        name: feed.name,
        color: feed.color,
      }),
    );
  }

  return mergeAndSortEvents(collected);
}
