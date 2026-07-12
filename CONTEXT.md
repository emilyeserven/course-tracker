# Course Tracker (emstack)

Course Tracker is an actionable dashboard for learning — "what should I do today?"
across routines and task lists. Record-keeping of the underlying links/resources is
being delegated to the companion **Simple Bookmarks** app.

## Language

**Bookmark**:
A saved link owned by the companion Simple Bookmarks app. Course Tracker references
bookmarks by their external `id` and caches a title/URL for display; it never owns
bookmark data.
_Avoid_: Link, URL, Resource (when you mean the Simple Bookmarks entity)

**Resource** _(removed)_:
Formerly a local learning resource (a course or a book) carrying progress, cost,
providers, modules/sections, and a usage log. Fully removed — record-keeping now
lives entirely in Simple Bookmarks; items associate with **Bookmarks** instead.
Kept here only so the term is recognized in history/older discussion.

**Task**:
A named list of to-dos toward a learning goal. May be associated with Bookmarks.
_Avoid_: Todo (a Task *contains* todos; they are not the same)

**Routine**:
A recurring commitment (weekly, daily, or curated) with completion tracking. A
**Daily** is a projection of a routine for a given day, not a stored entity.
_Avoid_: Habit, Daily (as a stored thing)
