---
name: add-field-to-entity
description: >-
  Add a new field/column to an existing entity (task, routine, task type,
  tag, tag group, daily criteria template, routine template, dashboard
  layout, settings…) end to end: DB schema, shared type, API handlers,
  client form and detail display. Use when asked to "add a field", "store X
  on Y", or "let users set X".
---

# Add a field to an existing entity (course-tracker)

The layers, in dependency order. Skipping one is the classic source of "saves but doesn't show up" bugs.

## 1. Database (`packages/middleware/src/db/schema/`)

- Add the column to the entity's table (file split by domain: `tasks.ts` holds tasks/task types/todos/bookmark junctions, `routines.ts` holds routines/connections/templates, `tags.ts`, `dailyCriteriaTemplates.ts`, `dashboardLayouts.ts`, `settings.ts`). New enums go in `enums.ts`.
- Plain new nullable column → `pnpm push:dev` is enough. Rename / backfill / data move → **use the `add-db-migration` skill** for a runtime migration first.

## 2. Shared type (`packages/types/src/`)

- Add the field to the entity's interface (e.g. `Task.ts`, `Routine.ts`, `Tag.ts`). Build it so consumers see it: `pnpm --filter=@emstack/types build` (or rely on `pnpm dev`'s watch).

## 3. Middleware (`packages/middleware/src/routes/api/<entity>/`)

- **`<entity>Rows.ts`** is the single source shared by create + upsert: add the field to the `<Entity>Body` interface, the `<entity>BodySchema` JSON schema (reuse `nullableString` / `nullableBoolean` / `nullableInteger` etc. from `src/utils/schemas.ts`), and `build<Entity>Row`.
- Note: rows files import `schemas.ts` **relatively** (`../../../utils/schemas.ts`), not via `@/`, so `node --test` can load them.
- **`upsert<Entity>.ts`**: add the column name to `updateableColumns` (and to `buildSetClause` if the entity uses partial-merge, like routines).
- **GET handlers**: if the entity has a projection (`src/utils/taskProjection.ts`, `dailyProjection.ts`, `routineProjection.ts`, `todoDailyProjection.ts`), add the field there — both list (`root.ts`) and single (`get<Entity>.ts`) flow through it. Remember dailies are a projection of routines, not their own table.
- **`duplicate<Entity>.ts`** (if it exists): copy the new field, or duplicates silently drop it.

## 4. Client

- **Edit page** `packages/client/src/routes/<entity>/$id/edit/route.tsx`:
  - add to the zod `formSchema`, to `startingValues` (with `data?.field ?? <default>`), to the payload passed to the submit handler, and a `form.AppField` control (`InputField`, `TextareaField`, `NumberField`, `RadioGroupField`, `DatePickerField`, `ComboboxField`, `MultiComboboxField` — registered in `hooks/useAppForm.ts`).
- **Detail page** `<entity>/$id/index.tsx`: display the field (import the read-only sections through the `components/infoCard` barrel — `InfoArea`, `InfoRow`).
- List/card views (`components/contentBoxComponents/*`) only if the field belongs there.

## 5. Verify

```bash
pnpm push:dev && pnpm typecheck && pnpm lint && pnpm verify:changed
```

Then runtime-check round-tripping (server must be running — `pnpm dev`):

```bash
curl -s -X POST http://localhost:3001/api/<entity>s -H 'Content-Type: application/json' \
  -d '{"name":"smoke","<field>":"value"}'        # returns {"status":"ok","id":...}
curl -s http://localhost:3001/api/<entity>s/<id> # field comes back
curl -s -X PUT  http://localhost:3001/api/<entity>s/<id> -H 'Content-Type: application/json' \
  -d '{"name":"smoke2","<field>":"value2"}'      # update persists
```

Gotcha: a PUT that omits optional junction arrays (tagIds, bookmarks, todos…) deliberately leaves those rows untouched — don't "fix" that.
