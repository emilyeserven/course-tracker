// Slimmed-down projection of a Readwise Reader document, returned by
// GET /api/readwise/reading-list. The middleware maps the raw Reader API
// document onto this shape so the client never sees the full payload.
export interface ReadwiseDocument {
  id: string;
  title: string;
  author: string | null;
  siteName: string | null;
  // Original source URL when available, falling back to the Reader URL.
  url: string;
  wordCount: number | null;
  summary: string | null;
  imageUrl: string | null;
  // Normalized to a 0–1 fraction regardless of the Reader API's scale.
  readingProgress: number;
}

export interface ReadwiseReadingList {
  // false when no Readwise token has been saved yet — lets the dashboard card
  // prompt the user to add one instead of surfacing an error.
  configured: boolean;
  // reading_progress strictly between 0 and 1.
  started: ReadwiseDocument[];
  // reading_progress of 0 (not yet opened).
  unstarted: ReadwiseDocument[];
}
