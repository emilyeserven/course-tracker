# Refactoring backlog

Deduplication candidates evaluated during the agent-experience pass
(June 2026). Done: `createCreateHandler` + shared `<entity>Rows.ts` files,
`makeSubmitHandler` in `useEditFormPage`.

## Deferred

- **Adopt `makeSubmitHandler` in the remaining edit pages** (`resources`,
  `domains`, `routines` use bespoke submit flows — multi-step saves, tabs,
  per-tab autosave). Adopt opportunistically when those pages are next
  touched; don't force it where the flow genuinely differs.
- **`EditFormLayout` component** wrapping form + `EditPageFooter` +
  `UnsavedChangesDialog`. Moderate win (~30 lines/page); revisit if more
  simple edit pages get added.
- **Delete the `utils/fetchFunctions.ts` shim** once nothing imports through
  the old path (it just re-exports `./api`).
- **`domains/createBlip.ts` / `bulkCreateBlips.ts`** stay bespoke (membership
  diffing, bulk semantics); could share blip row builders if they grow.

## Rejected (don't redo this analysis)

- **`createListHandler` factory for the 13 `root.ts` GET handlers** — the
  handlers are dominated by entity-specific Drizzle `with:` joins and
  projections; the shareable shell is ~10 lines. A factory would force a
  config DSL that's harder to read than the Fastify handler it replaces.
  Shared projections in `src/utils/*Projection.ts` already capture the
  duplicated mapping logic.
