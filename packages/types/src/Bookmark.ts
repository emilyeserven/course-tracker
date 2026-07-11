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

// One selectable section within a bookmark, flattened from the bookmark's
// two-tier SectionEntry list (any entry — group or leaf — is selectable). `id`
// is the SectionEntry id (unique within the bookmark); `label` is a readable
// name with tier context (e.g. "Part I › Chapter 3"). Returned by the
// course-tracker proxy GET /api/bookmarks/:id/sections.
export interface BookmarkSection {
  id: string;
  label: string;
}
