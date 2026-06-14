import type { ReadwiseDocument } from "@emstack/types";
import { db } from "@/db";
import { appSettings } from "@/db/schema";

const READWISE_LIST_URL = "https://readwise.io/api/v3/list/";
const READWISE_SAVE_URL = "https://readwise.io/api/v3/save/";

// Tag stamped on everything saved from Course Tracker so the source is traceable
// inside Readwise.
const SOURCE_TAG = "from-coursetracker";

// Active reading locations only — archived/feed items are excluded so the card
// shows a true "to read" / "reading" list. A document lives in exactly one
// location, so there is no cross-location duplication to worry about.
const ACTIVE_LOCATIONS = ["new", "later", "shortlist"] as const;

// Bound pagination so a large library can't blow past Readwise's ~20 req/min
// rate limit (or hang the request). A few hundred articles per location is far
// more than a dashboard card needs.
const MAX_PAGES_PER_LOCATION = 5;

/** Raw shape of the fields we read off a Reader API document. */
interface RawReadwiseDocument {
  id: string;
  title?: string | null;
  author?: string | null;
  site_name?: string | null;
  url?: string | null;
  source_url?: string | null;
  word_count?: number | null;
  summary?: string | null;
  image_url?: string | null;
  reading_progress?: number | null;
  category?: string | null;
}

interface RawListResponse {
  count: number;
  nextPageCursor: string | null;
  results: RawReadwiseDocument[];
}

/** Error carrying an HTTP status so the route can map it to a friendly reply. */
export class ReadwiseError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ReadwiseError";
    this.statusCode = statusCode;
  }
}

/**
 * Resolve the Readwise token: the DB-stored key (set via Settings) takes
 * precedence, falling back to the READWISE_API_KEY env var for deployments that
 * prefer to inject it. Returns null when neither is set.
 */
export async function getReadwiseToken(): Promise<string | null> {
  const [row] = await db.select().from(appSettings).limit(1);
  const stored = row?.readwiseApiKey?.trim();
  if (stored) return stored;
  const fromEnv = process.env.READWISE_API_KEY?.trim();
  return fromEnv ? fromEnv : null;
}

/**
 * Translate a non-OK Readwise response into a friendly ReadwiseError.
 * Shared by every Readwise call so they map statuses consistently. Readwise
 * answers 401 (missing auth) or 403 (bad token) for auth failures.
 */
function assertReadwiseOk(response: Response): void {
  if (response.status === 401 || response.status === 403) {
    throw new ReadwiseError("Readwise rejected the API key.", 401);
  }
  if (response.status === 429) {
    throw new ReadwiseError("Readwise rate limit reached — try again shortly.", 429);
  }
  if (!response.ok) {
    throw new ReadwiseError(`Readwise request failed (${response.status}).`, 502);
  }
}

// Readwise documents reading_progress as a 0–1 float, but some clients report
// 0–100; normalize defensively so the partition logic is scale-independent.
function normalizeProgress(value: number | null | undefined): number {
  const raw = typeof value === "number" && Number.isFinite(value) ? value : 0;
  const fraction = raw > 1 ? raw / 100 : raw;
  return Math.max(0, Math.min(1, fraction));
}

function mapDocument(doc: RawReadwiseDocument): ReadwiseDocument {
  return {
    id: doc.id,
    title: doc.title?.trim() || "Untitled",
    author: doc.author ?? null,
    siteName: doc.site_name ?? null,
    url: doc.source_url || doc.url || "",
    wordCount: doc.word_count ?? null,
    summary: doc.summary ?? null,
    imageUrl: doc.image_url ?? null,
    readingProgress: normalizeProgress(doc.reading_progress),
  };
}

async function fetchLocation(
  token: string,
  location: string,
): Promise<RawReadwiseDocument[]> {
  const collected: RawReadwiseDocument[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES_PER_LOCATION; page++) {
    const params = new URLSearchParams({
      category: "article",
      location,
    });
    if (cursor) params.set("pageCursor", cursor);

    let response: Response;
    try {
      response = await fetch(`${READWISE_LIST_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
    }
    catch {
      throw new ReadwiseError("Could not reach Readwise.", 502);
    }

    assertReadwiseOk(response);

    const body = (await response.json()) as RawListResponse;
    collected.push(...(body.results ?? []));

    cursor = body.nextPageCursor;
    if (!cursor) break;
  }

  return collected;
}

export interface ReadwiseReadingListData {
  started: ReadwiseDocument[];
  unstarted: ReadwiseDocument[];
}

/**
 * Fetch article documents across the active reading locations and partition
 * them by reading progress: "started" is strictly between 0 and 1, "unstarted"
 * is 0. Finished articles (progress of 1, typically archived) fall into neither.
 */
export async function fetchReadingList(
  token: string,
): Promise<ReadwiseReadingListData> {
  const byId = new Map<string, RawReadwiseDocument>();
  for (const location of ACTIVE_LOCATIONS) {
    const docs = await fetchLocation(token, location);
    for (const doc of docs) {
      if (doc.id) byId.set(doc.id, doc);
    }
  }

  const started: ReadwiseDocument[] = [];
  const unstarted: ReadwiseDocument[] = [];
  for (const raw of byId.values()) {
    const mapped = mapDocument(raw);
    if (mapped.readingProgress > 0 && mapped.readingProgress < 1) {
      started.push(mapped);
    }
    else if (mapped.readingProgress <= 0) {
      unstarted.push(mapped);
    }
  }

  // Surface the closest-to-finished items first in the "in progress" tab.
  started.sort((a, b) => b.readingProgress - a.readingProgress);

  return {
    started,
    unstarted,
  };
}

/**
 * Save a URL to the user's Readwise Reader, tagged with the source tag.
 * Readwise resolves the title/metadata from the page itself, so `title` is only
 * an override hint. Returns the created (or pre-existing) document's id and url.
 */
export async function saveReadwiseDocument(
  token: string,
  url: string,
  title?: string,
): Promise<{ id: string;
  url: string; }> {
  let response: Response;
  try {
    response = await fetch(READWISE_SAVE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        tags: [SOURCE_TAG],
        ...(title
          ? {
            title,
          }
          : {}),
      }),
    });
  }
  catch {
    throw new ReadwiseError("Could not reach Readwise.", 502);
  }

  assertReadwiseOk(response);

  const body = (await response.json()) as {
    id?: string;
    url?: string;
  };
  return {
    id: body.id ?? "",
    url: body.url ?? url,
  };
}
