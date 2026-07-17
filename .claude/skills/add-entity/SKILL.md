---
name: add-entity
description: >-
  Add a brand-new resource/entity to the app end to end: DB table, shared
  type, middleware CRUD route folder, client API helpers, route pages and
  navigation. Use when asked to "add a new resource/entity/model" or "track
  a new kind of thing".
---

# Add a new entity (course-tracker)

Work through the layers in order; each one depends on the previous. `references/file-checklist.md` lists every file a finished entity touches — diff your work against it before declaring done. Mirror an existing entity of similar shape throughout (junction-ful → **tasks**; plain → **task-types**; JSONB-heavy → **routines**).

## 1. Schema — `packages/middleware/src/db/schema/`

- New table in the matching domain file (or a new file, re-exported from `schema/index.ts`). Copy column idioms from a sibling table (uuid pk, `statusEnum`, timestamps).
- All `relations()` go in `relations.ts`; junction tables live next to the entity.
- `pnpm push:dev` to create it. Existing-data transforms → `add-db-migration` skill.

## 2. Shared type — `packages/types/src/`

- `<Name>.ts` interface, re-export from `index.ts`, then `pnpm --filter=@emstack/types build`.

## 3. Middleware — `packages/middleware/src/routes/api/<name>/`

Files (see `tasks/` for the junction-ful version, `task-types/` for the minimal one):

- `<name>Rows.ts` — `<Name>Body` interface, `<name>BodySchema` (reuse `src/utils/schemas.ts` fragments; import it **relatively** — `../../../utils/schemas.ts` — so `node --test` can load the file), `build<Name>Row`, junction row builders (return `undefined` when input absent, `[]` to clear).
- `create<Name>.ts` — `createCreateHandler` from `src/utils/createCreateHandler.ts`.
- `upsert<Name>.ts` — `createUpsertHandler` (junction sync, `updateableColumns`, optional `buildSetClause` for partial merge).
- `delete<Name>.ts` — `createDeleteHandler` (junction cascade, optional reference `guard` → 409).
- `get<Name>.ts` + `root.ts` — GET single / GET list + POST registration; share any row→DTO mapping via a projection in `src/utils/` when list and single return the same shape.
- `duplicate<Name>.ts` — only if duplication makes sense (see `routines/duplicateRoutine.ts`).
- `routes.ts` — registers the handlers; then add `fastify.register(<name>, { prefix: "/<name>" })` in `src/routes/api/routes.ts`.

## 4. Client API — `packages/client/src/utils/api/`

- `<name>.ts` with `export const <name>Api = createEntityClient<Type>("<endpoint>", "<label>")` plus named re-exports (`fetchXs = xsApi.list`, …); re-export from `api/index.ts`.

## 5. Client routes — `packages/client/src/routes/`

- Folder-based routes: `<name>/route.tsx` (layout, usually a bare `<Outlet/>`), `<name>/index.tsx` (list), `<name>/$id/route.tsx`, `<name>/$id/index.tsx` (detail), `<name>/$id/edit/route.tsx` (edit/create — `id === "new"`).
- Edit page: `useEditFormPage` (`makeSubmitHandler` + `makeDeleteHandler` + `shouldBlockFn`), `useAppForm` with a zod schema, `EditPageFooter` + `UnsavedChangesDialog`. Copy `tasks/$id/edit/route.tsx`.
- Loading/error: `EntityPending` / `EntityError` from `components/listControls/EntityStates.tsx`.
- List card → new `components/contentBoxComponents/<Name>Box.tsx` if the list shows cards (add it to the `contentBoxComponents/index.ts` barrel).
- Regenerate the route tree: `pnpm --filter=@emstack/client run routeTree` (never edit `routeTree.gen.ts`).

## 6. Navigation

- `components/layout/sidebar/navConfig.ts`: add a `NavCategory` (list link, quick-add key, detail-link builder, lazy `load`) under the matching `NavSection` — the collapsible sidebar renders from this config.
- `components/layout/PageHeader.tsx`: add the new `pageSection` if the header maps sections.

## 7. Verify

```bash
pnpm push:dev && pnpm typecheck && pnpm lint && pnpm --filter=@emstack/client exec vitest run && pnpm --filter=@emstack/middleware test && pnpm build
```

Runtime smoke (server running via `pnpm dev`): POST → GET list → GET single → PUT → DELETE through `http://localhost:3001/api/<name>`, then click through list → create → edit → delete in the UI at `http://localhost:5173`. Check `git diff --stat`: `routeTree.gen.ts` should be regenerated, nothing else unexpected.
