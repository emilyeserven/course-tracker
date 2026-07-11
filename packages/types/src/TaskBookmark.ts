// A task's association to a Simple Bookmarks bookmark. `bookmarkId` is the
// external id in the companion app (there is no foreign key — the bookmark
// lives in a separate database). `title` / `url` are a denormalized cache of
// the bookmark at association time so the chip still renders when Simple
// Bookmarks is unreachable; they are refreshed opportunistically on read.
//
// A task can hold multiple bookmark associations, so each carries a stable
// per-row `id`. This shape is intentionally forward-compatible: a later
// increment will add an optional section reference for narrowing.
export interface TaskBookmark {
  id?: string;
  bookmarkId: string;
  title: string;
  url: string | null;
  position?: number | null;
}
