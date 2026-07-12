// How clicking a bookmark link behaves app-wide: open the bookmark's underlying
// page (the article/book/video itself), or the bookmark's own page in the
// companion Simple Bookmarks app. Stored as a global app setting.
export type BookmarkClickTarget = "page" | "bookmark";
