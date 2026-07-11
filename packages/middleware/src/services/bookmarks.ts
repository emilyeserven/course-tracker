import type { BookmarkSection, BookmarkSummary } from "@emstack/types";

// Base URL of the companion Simple Bookmarks app. Configurable so the same
// build works across environments; defaults to the self-hosted instance.
const DEFAULT_BASE_URL = "http://eserve-raspi:3000";

function baseUrl(): string {
  const configured = process.env.BOOKMARKS_API_URL?.trim();
  return (configured || DEFAULT_BASE_URL).replace(/\/+$/, "");
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
    return await fetch(`${baseUrl()}${path}`, init);
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
