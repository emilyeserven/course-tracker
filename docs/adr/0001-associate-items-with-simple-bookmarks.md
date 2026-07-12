# Delegate link/resource record-keeping to Simple Bookmarks

Course Tracker is narrowing to an actionable dashboard; the companion **Simple
Bookmarks** app owns links/resources (tags, taxonomies, progress, sections) better
than our local Resource model. We are **incrementally** migrating item→Resource
associations to item→Bookmark associations, starting with a task-level Bookmark
association that coexists with the existing Resource links.

Bookmarks live in a **separate database**, so Course Tracker references them by
external `id` and stores a denormalized `title`/`url` cache (rendered when Simple
Bookmarks is unreachable). The integration is **proxied through Course Tracker's own
middleware** (`BOOKMARKS_API_URL`) so the browser stays same-origin and label
caching / graceful degradation live in one place — rather than the browser calling
Simple Bookmarks directly, which would require CORS and expose the internal service
URL.

Resources are being phased out but kept for now (they still carry cost/amortization,
the interactions log, and modules); their eventual fate — migrate to bookmark
custom-properties or drop — is deferred to a later increment.

_Update: that increment landed — see [ADR 0002](0002-remove-the-resource-subsystem.md),
which removes the Resource subsystem entirely and resolves the deferred question by
dropping cost/interactions/providers with no migration._

## Status

accepted (superseded in part by ADR 0002)
