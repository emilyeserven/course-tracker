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

**Resource**:
A local learning resource (a course or a book) carrying progress, cost, and modules.
Being phased out — the things that reference Resources are migrating to reference
Bookmarks instead. Prefer Bookmark for new associations.
_Avoid_: Course (legacy name; the table is still `resources`/`tasks_to_courses`)

**Task**:
A named list of to-dos toward a learning goal. May be associated with Bookmarks
(and, during the transition, Resources).
_Avoid_: Todo (a Task *contains* todos; they are not the same)

**Routine**:
A recurring commitment (weekly, daily, or curated) with completion tracking. A
**Daily** is a projection of a routine for a given day, not a stored entity.
_Avoid_: Habit, Daily (as a stored thing)
