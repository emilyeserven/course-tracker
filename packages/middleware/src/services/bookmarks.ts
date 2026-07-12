import type { BookmarkSection, BookmarkSummary } from "@emstack/types";

// Base URL of the companion Simple Bookmarks app. Configurable so the same
// build works across environments; defaults to the self-hosted instance.
const DEFAULT_BASE_URL = "http://eserve-raspi:3000";

// Resolve the effective base URL from an optional stored override: the DB value
// wins, then the BOOKMARKS_API_URL env var, then the built-in default. Trailing
// slashes are stripped so callers can concatenate paths. Pure (no DB read) so it
// is unit-testable and reused by the settings GET to report the resolved value.
export function resolveBookmarksBaseUrl(override?: string | null): string {
  const configured = override?.trim() || process.env.BOOKMARKS_API_URL?.trim();
  return (configured || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

// The effective base URL, reading the stored override from app settings first
// (mirrors getReadwiseToken's DB-first-then-env resolution). `db` is imported
// lazily so this module stays free of a static `@/db` dependency — that keeps it
// loadable under `node --test` (which doesn't resolve the `@/` alias), matching
// the googleCalendarIcs/googleCalendar split. If settings can't be read, fall
// back to the env/default URL so bookmark proxying still works. Internal only —
// bookmarksFetch resolves the base URL through it; the settings GET reports the
// resolved value via the pure resolveBookmarksBaseUrl instead.
async function getBookmarksBaseUrl(): Promise<string> {
  try {
    const {
      db,
    } = await import("@/db");
    const {
      appSettings,
    } = await import("@/db/schema");
    const [row] = await db.select().from(appSettings).limit(1);
    return resolveBookmarksBaseUrl(row?.bookmarkApiUrl);
  }
  catch {
    return resolveBookmarksBaseUrl(null);
  }
}

/** Error carrying an HTTP status so the route can map it to a friendly reply. */
export class BookmarksError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "BookmarksError";
    this.statusCode = statusCode;
  }
}

/** Raw shape of the fields we read off a Simple Bookmarks bookmark. */
interface RawBookmark {
  id: string;
  title?: string | null;
  url?: string | null;
  // Numeric progress custom-properties (e.g. page 45 of 320). In practice a
  // bookmark carries at most one, so consumers read progressValues[0].
  progressValues?: { current: number;
    total: number; }[] | null;
}

// The subset of GET /api/bookmarks/url-check we consume: the exact / path match
// when the URL is already saved.
interface RawUrlCheckResult {
  exactMatch: RawBookmark | null;
  pathMatch: RawBookmark | null;
}

function mapBookmark(b: RawBookmark): BookmarkSummary {
  return {
    id: b.id,
    title: b.title?.trim() || "Untitled",
    url: b.url ?? null,
  };
}

// All requests target the fixed BOOKMARKS_API_URL origin; user input only ever
// reaches the query string / body (URL-encoded), so these are not SSRF sinks.
async function bookmarksFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    // fallow-ignore-next-line security-sink
    return await fetch(`${await getBookmarksBaseUrl()}${path}`, init);
  }
  catch {
    throw new BookmarksError("Could not reach Simple Bookmarks.", 502);
  }
}

function assertOk(response: Response): void {
  if (!response.ok) {
    throw new BookmarksError(`Simple Bookmarks request failed (${response.status}).`, 502);
  }
}

/**
 * Search bookmarks by a title/URL substring. Simple Bookmarks has no text-search
 * endpoint, so we pull the (optionally tag-filtered) list and filter here. Fine
 * for a bounded personal library; revisit with a real search endpoint if it grows.
 */
export async function searchBookmarks(
  query: string,
  limit = 20,
): Promise<BookmarkSummary[]> {
  const response = await bookmarksFetch("/api/bookmarks");
  assertOk(response);

  const all = (await response.json()) as RawBookmark[];
  const mapped = all.map(mapBookmark);

  const q = query.trim().toLowerCase();
  const matches = q
    ? mapped.filter(
      b => b.title.toLowerCase().includes(q) || (b.url ?? "").toLowerCase().includes(q),
    )
    : mapped;

  return matches.slice(0, limit);
}

/**
 * Fetch numeric reading progress for a set of bookmark ids, keyed by id. Reuses
 * the single full-list endpoint (Simple Bookmarks has no batch-by-id lookup and
 * the library is bounded) and keeps only bookmarks that have progress. Best
 * effort: any failure (unreachable app, bad response) resolves to an empty map
 * so callers — the dashboard's daily projection — still render without it.
 */
export async function getBookmarkProgress(
  ids: string[],
): Promise<Map<string, { current: number;
  total: number; }>> {
  const progress = new Map<string, { current: number;
    total: number; }>();
  if (ids.length === 0) {
    return progress;
  }

  const wanted = new Set(ids);
  try {
    const response = await bookmarksFetch("/api/bookmarks");
    assertOk(response);
    const all = (await response.json()) as RawBookmark[];
    for (const bookmark of all) {
      if (!wanted.has(bookmark.id)) continue;
      const value = bookmark.progressValues?.[0];
      // A zero/absent total is not real progress (e.g. a bookmark that tracks
      // progress but hasn't set a total) — treat it as "no progress" so the
      // caller falls back to the infinity icon rather than an empty ring.
      if (value && value.total > 0) {
        progress.set(bookmark.id, {
          current: value.current,
          total: value.total,
        });
      }
    }
  }
  catch {
    // Simple Bookmarks unreachable or malformed — degrade to no progress.
    return new Map();
  }

  return progress;
}

/** Resolve a URL to an already-saved bookmark, or null if none exists. */
export async function resolveBookmarkByUrl(url: string): Promise<BookmarkSummary | null> {
  const response = await bookmarksFetch(
    `/api/bookmarks/url-check?url=${encodeURIComponent(url)}`,
  );
  assertOk(response);

  const body = (await response.json()) as RawUrlCheckResult;
  const match = body.exactMatch ?? body.pathMatch ?? null;
  return match ? mapBookmark(match) : null;
}

// A bookmark's section entries live under one or more "sections" custom
// properties; each entry is two-tier (a header with optional child leaves).
interface RawSectionEntry {
  id: string;
  name?: string | null;
  children?: RawSectionEntry[] | null;
}
interface RawSectionsValue {
  sections?: RawSectionEntry[] | null;
}
interface RawBookmarkDetail {
  sectionsValues?: RawSectionsValue[] | null;
}

/**
 * Fetch a bookmark's sections, flattened to a pickable list. Any entry (tier-1
 * header or tier-2 leaf) is selectable; leaves are labelled with their parent
 * for context ("Part I › Chapter 3"). Entry ids are unique within a bookmark.
 */
export async function getBookmarkSections(
  bookmarkId: string,
): Promise<BookmarkSection[]> {
  const response = await bookmarksFetch(
    `/api/bookmarks/${encodeURIComponent(bookmarkId)}`,
  );
  assertOk(response);

  const body = (await response.json()) as RawBookmarkDetail;
  const sections: BookmarkSection[] = [];
  for (const value of body.sectionsValues ?? []) {
    for (const entry of value.sections ?? []) {
      const name = entry.name?.trim() || "Untitled section";
      sections.push({
        id: entry.id,
        label: name,
      });
      for (const child of entry.children ?? []) {
        sections.push({
          id: child.id,
          label: `${name} › ${child.name?.trim() || "Untitled"}`,
        });
      }
    }
  }
  return sections;
}

/**
 * Create a bookmark from a URL (Simple Bookmarks resolves title/metadata from
 * the page). If the URL is already saved (409), fall back to resolving the
 * existing bookmark so the caller always gets one back.
 */
export async function createBookmark(
  url: string,
  title?: string,
): Promise<BookmarkSummary> {
  const response = await bookmarksFetch("/api/bookmarks/quick-add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      ...(title
        ? {
          title,
        }
        : {}),
    }),
  });

  if (response.status === 409) {
    const existing = await resolveBookmarkByUrl(url);
    if (existing) return existing;
    throw new BookmarksError("This URL is already saved in Simple Bookmarks.", 409);
  }

  assertOk(response);
  const body = (await response.json()) as RawBookmark;
  return mapBookmark(body);
}
