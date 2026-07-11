// Slimmed-down projection of a Simple Bookmarks bookmark, returned by the
// course-tracker bookmark proxy routes (GET /api/bookmarks/search, /resolve).
// The middleware maps the raw bookmarks API payload onto this shape so the
// client never sees the full record. Bookmarks are owned by the companion
// Simple Bookmarks app; course-tracker only ever references them by `id`.
export interface BookmarkSummary {
  id: string;
  title: string;
  // A bookmark's URL is nullable on the Simple Bookmarks side, so it may be
  // absent here too.
  url: string | null;
}
