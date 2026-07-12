# Remove the Resource subsystem

This completes the migration begun in
[ADR 0001](0001-associate-items-with-simple-bookmarks.md): the local **Resource**
model is removed entirely. Course Tracker keeps only what makes it an actionable
dashboard — tasks, todos, and routines — and those associate with external **Bookmarks**
(owned by the companion Simple Bookmarks app), never local resources.

Removed in one change (big-bang, mirroring the earlier Domains and Topics removals):
the `resources`, `courseProviders`, `module_groups`, `modules`, and `interactions`
tables; the resource↔task/tag junctions (`tasks_to_courses`, `task_resources`,
`resource_tags`, `module_group_tags`, `module_tags`); the resource-link columns on
`task_todos`; the `app_settings.module_hint_templates` column; the `"resource"`
variants of the routine connection and schedule-entry reference types; the resource
enum types; and all resource/provider/module/interaction routes, UI, and onboarding.

## Resolution of ADR 0001's deferred question

ADR 0001 deferred what happens to Resources' **cost/amortization**, the **interactions
usage log**, and **providers**. Decision: **drop all of it, with no migration.** That
record-keeping belongs in Simple Bookmarks (which already tracks progress, sections,
tags/taxonomies, and page state) — carrying it here would re-introduce the local model
we are deleting. Existing rows are dropped by the idempotent `migrateDropResources`
runtime migration (runs before `drizzle-kit push`, so push never prompts on the
destructive diff and the non-TTY deploy doesn't hang).

## Status

accepted
