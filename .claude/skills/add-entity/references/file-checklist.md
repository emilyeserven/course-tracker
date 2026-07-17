# New-entity file checklist

Distilled from the Routines resource (commit `9e4d1af`, 24 files) plus the
factory refactors that landed since. `<name>` = plural kebab/camel entity name.

## Database & types

- [ ] `packages/middleware/src/db/schema/<domain>.ts` — table (+ junction tables)
- [ ] `packages/middleware/src/db/schema/relations.ts` — relations
- [ ] `packages/middleware/src/db/schema/enums.ts` — only if a new enum
- [ ] `packages/types/src/<Name>.ts` — shared interface
- [ ] `packages/types/src/index.ts` — re-export

## Middleware (`packages/middleware/src/routes/api/<name>/`)

- [ ] `<name>Rows.ts` — body interface + JSON body schema + row/junction builders
- [ ] `create<Name>.ts` — `createCreateHandler`
- [ ] `upsert<Name>.ts` — `createUpsertHandler`
- [ ] `delete<Name>.ts` — `createDeleteHandler`
- [ ] `get<Name>.ts` — GET `/:id`
- [ ] `root.ts` — GET `/` list
- [ ] `duplicate<Name>.ts` — optional
- [ ] `routes.ts` — registers the above
- [ ] `packages/middleware/src/routes/api/routes.ts` — `fastify.register(..., { prefix })`
- [ ] `packages/middleware/src/utils/<name>Projection.ts` — optional shared row→DTO mapper
- [ ] `packages/middleware/src/utils/schemas.ts` — only if new reusable schema fragments

## Client

- [ ] `packages/client/src/utils/api/<name>.ts` — `createEntityClient` + named exports
- [ ] `packages/client/src/utils/api/index.ts` — re-export
- [ ] `packages/client/src/routes/<name>/route.tsx` — layout
- [ ] `packages/client/src/routes/<name>/index.tsx` — list page
- [ ] `packages/client/src/routes/<name>/$id/route.tsx` — detail layout
- [ ] `packages/client/src/routes/<name>/$id/index.tsx` — detail page
- [ ] `packages/client/src/routes/<name>/$id/edit/route.tsx` — edit/create page
- [ ] `packages/client/src/components/contentBoxComponents/<Name>Box.tsx` — list card (if cards; add to the `contentBoxComponents/index.ts` barrel)
- [ ] `packages/client/src/components/<name>/…` — entity-specific widgets (as needed)
- [ ] `packages/client/src/components/layout/sidebar/navConfig.ts` — sidebar NavCategory entry
- [ ] `packages/client/src/components/layout/PageHeader.tsx` — page section (if mapped)
- [ ] `packages/client/src/routeTree.gen.ts` — regenerated, never hand-edited
