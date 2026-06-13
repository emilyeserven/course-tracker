import { randomUUID } from "node:crypto";

import type {
  GoogleCalendarEvent,
  GoogleCalendarListEntry,
} from "@emstack/types";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import {
  mapEvent,
  mergeAndSortEvents,
  type RawEvent,
} from "@/services/googleCalendarMap";

// Google OAuth 2.0 + Calendar API v3 endpoints. We talk to them with native
// `fetch` (no SDK) to match the Readwise/Todoist services and keep the
// dependency footprint flat.
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const CALENDAR_LIST_URL
  = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
const eventsUrl = (calendarId: string) =>
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;

// Read-only access plus the account email (shown in Settings to confirm which
// account is connected).
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

// How far ahead the dashboard agenda looks, and a per-calendar event cap so a
// busy calendar can't balloon the response.
const DAYS_AHEAD = 14;
const MAX_EVENTS_PER_CALENDAR = 50;

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

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/** The server-side OAuth app credentials, or null when not all are configured. */
function oauthConfig(): OAuthConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
  if (!clientId || !clientSecret || !redirectUri) return null;
  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

export function googleOAuthConfigured(): boolean {
  return oauthConfig() !== null;
}

function requireConfig(): OAuthConfig {
  const cfg = oauthConfig();
  if (!cfg) {
    throw new GoogleCalendarError(
      "Google OAuth is not configured on the server.",
      500,
    );
  }
  return cfg;
}

// --- CSRF state ------------------------------------------------------------
// A single in-process value bridges the connect → callback round trip. This is
// sufficient for a single-user, single-process deployment and avoids pulling in
// a cookie/session dependency. The round trip is seconds long, so a middleware
// restart in between (which would clear this) is a non-issue in practice.
let pendingState: string | null = null;

export function createOAuthState(): string {
  pendingState = randomUUID();
  return pendingState;
}

export function consumeOAuthState(state: string | undefined): boolean {
  const ok = Boolean(state) && state === pendingState;
  pendingState = null;
  return ok;
}

/** Build the Google consent URL. `prompt=consent` + `access_type=offline`
 * ensures a refresh token comes back so we can keep syncing without re-auth. */
export function getAuthUrl(state: string): string {
  const cfg = requireConfig();
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

async function postToken(body: URLSearchParams): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  }
  catch {
    throw new GoogleCalendarError("Could not reach Google.", 502);
  }
  // 400/401 from the token endpoint means the grant is no longer valid (revoked
  // access, expired refresh token) — the user must reconnect.
  if (response.status === 400 || response.status === 401) {
    throw new GoogleCalendarError(
      "Google Calendar access expired — reconnect it in Settings.",
      401,
    );
  }
  if (!response.ok) {
    throw new GoogleCalendarError(
      `Google token request failed (${response.status}).`,
      502,
    );
  }
  return (await response.json()) as Record<string, unknown>;
}

async function fetchAccountEmail(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { email?: string };
    return body.email ?? null;
  }
  catch {
    return null;
  }
}

/** Exchange an authorization code for tokens and persist them. */
export async function connectWithCode(code: string): Promise<void> {
  const cfg = requireConfig();
  const tokens = await postToken(
    new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: cfg.redirectUri,
      grant_type: "authorization_code",
    }),
  );

  const accessToken = typeof tokens.access_token === "string"
    ? tokens.access_token
    : null;
  const refreshToken = typeof tokens.refresh_token === "string"
    ? tokens.refresh_token
    : null;
  if (!accessToken) {
    throw new GoogleCalendarError(
      "Google did not return an access token.",
      502,
    );
  }

  const email = await fetchAccountEmail(accessToken);

  // Only overwrite the refresh token when Google sends one (it always does with
  // prompt=consent, but guard so we never clobber a good token with null).
  const set: Partial<typeof appSettings.$inferInsert> = {
    googleAccessToken: accessToken,
    googleAccountEmail: email,
  };
  if (refreshToken) set.googleRefreshToken = refreshToken;

  await db
    .insert(appSettings)
    .values({
      id: SETTINGS_ROW_ID,
      ...set,
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set,
    });
}

/** Clear all Google Calendar state (tokens, email, calendar selection). */
export async function disconnectGoogle(): Promise<void> {
  await db
    .insert(appSettings)
    .values({
      id: SETTINGS_ROW_ID,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleAccountEmail: null,
      googleSelectedCalendarIds: [],
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleAccountEmail: null,
        googleSelectedCalendarIds: [],
      },
    });
}

interface Connection {
  accessToken: string;
  refreshToken: string | null;
  selectedCalendarIds: string[];
}

/** The stored Google connection, or null when not connected. */
export async function getConnection(): Promise<Connection | null> {
  const [row] = await db.select().from(appSettings).limit(1);
  const accessToken = row?.googleAccessToken?.trim();
  if (!accessToken) return null;
  return {
    accessToken,
    refreshToken: row?.googleRefreshToken?.trim() || null,
    selectedCalendarIds: row?.googleSelectedCalendarIds ?? [],
  };
}

/** Mint a fresh access token from the stored refresh token and persist it. */
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const cfg = requireConfig();
  const tokens = await postToken(
    new URLSearchParams({
      refresh_token: refreshToken,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      grant_type: "refresh_token",
    }),
  );
  const accessToken = typeof tokens.access_token === "string"
    ? tokens.access_token
    : null;
  if (!accessToken) {
    throw new GoogleCalendarError(
      "Google did not return a refreshed access token.",
      502,
    );
  }
  await db
    .insert(appSettings)
    .values({
      id: SETTINGS_ROW_ID,
      googleAccessToken: accessToken,
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        googleAccessToken: accessToken,
      },
    });
  return accessToken;
}

/**
 * GET a Calendar API URL with the connection's access token, transparently
 * refreshing once on a 401/403 (the token expired or was rotated). Mutates
 * `conn.accessToken` so callers sharing the connection reuse the fresh token.
 */
async function authedGet(url: string, conn: Connection): Promise<Response> {
  const send = (token: string) =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {
      throw new GoogleCalendarError("Could not reach Google.", 502);
    });

  let response = await send(conn.accessToken);
  if ((response.status === 401 || response.status === 403) && conn.refreshToken) {
    conn.accessToken = await refreshAccessToken(conn.refreshToken);
    response = await send(conn.accessToken);
  }
  if (response.status === 401 || response.status === 403) {
    throw new GoogleCalendarError(
      "Google Calendar access expired — reconnect it in Settings.",
      401,
    );
  }
  if (!response.ok) {
    throw new GoogleCalendarError(
      `Google Calendar request failed (${response.status}).`,
      502,
    );
  }
  return response;
}

interface RawCalendarListEntry {
  id?: string;
  summary?: string | null;
  summaryOverride?: string | null;
  backgroundColor?: string | null;
  primary?: boolean | null;
}

/** The user's calendars, for the Settings multi-select. */
export async function fetchCalendarList(
  conn: Connection,
): Promise<GoogleCalendarListEntry[]> {
  const response = await authedGet(`${CALENDAR_LIST_URL}?minAccessRole=reader`, conn);
  const body = (await response.json()) as { items?: RawCalendarListEntry[] };
  return (body.items ?? [])
    .filter((item): item is RawCalendarListEntry & { id: string } =>
      typeof item.id === "string")
    .map(item => ({
      id: item.id,
      summary: (item.summaryOverride || item.summary || item.id).trim(),
      backgroundColor: item.backgroundColor ?? null,
      primary: item.primary ?? false,
    }));
}

/**
 * Fetch upcoming events across the selected calendars, merged and sorted. The
 * calendar list is fetched once to resolve each calendar's name and colour;
 * selections that no longer exist (calendar removed/unshared) are skipped.
 */
export async function fetchUpcomingEvents(
  conn: Connection,
  calendarIds: string[],
): Promise<GoogleCalendarEvent[]> {
  if (calendarIds.length === 0) return [];

  const calendars = await fetchCalendarList(conn);
  const metaById = new Map(calendars.map(c => [c.id, c]));

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(
    now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000,
  ).toISOString();

  const collected: GoogleCalendarEvent[] = [];
  // Sequential so a single token refresh (mutating `conn`) is reused by the
  // remaining calendars instead of each racing its own refresh.
  for (const calendarId of calendarIds) {
    const meta = metaById.get(calendarId);
    if (!meta) continue;
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: String(MAX_EVENTS_PER_CALENDAR),
    });
    const response = await authedGet(
      `${eventsUrl(calendarId)}?${params.toString()}`,
      conn,
    );
    const body = (await response.json()) as { items?: RawEvent[] };
    for (const raw of body.items ?? []) {
      if (raw.status === "cancelled") continue;
      collected.push(
        mapEvent(raw, calendarId, meta.summary, meta.backgroundColor),
      );
    }
  }

  return mergeAndSortEvents(collected);
}
