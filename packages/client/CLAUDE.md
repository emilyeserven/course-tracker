# CLAUDE.md — @emstack/client

React 19 + Vite frontend. Read the root CLAUDE.md for commands and setup; this file covers client conventions.

## Routing

- File-based routing with TanStack Router; route files live in `src/routes/`.
- Naming: `foo.tsx` is the layout, `foo.index.tsx` the index page, `foo.$id.tsx` the dynamic-segment layout, `foo.$id.edit.tsx` a child route. Route-private components live in sibling `foo.-components/` directories (the `.-` prefix keeps them out of routing).
- `src/routeTree.gen.ts` is **generated — never edit or read it**. Regenerate with `pnpm --filter=@emstack/client run routeTree` (the vite dev server also regenerates it on save).
- Path alias: `@` → `packages/client/src`.

## Fetch layer (`src/utils/api/`)

- `client.ts` exports `fetchJson`/`postJson`/`putJson`/`deleteJson` and `createEntityClient<TEntity, TList>(endpoint, label)`, which returns `{ list, get, create, upsert, delete, duplicate }` against `/api/<endpoint>`.
- Each entity has a file (`topics.ts`, `resources.ts`, `routines.ts`, …) exporting a `<name>Api` client plus named function re-exports (`upsertTopic`, `fetchSingleTopic`, …). Custom endpoints (e.g. `incrementResourceProgress`) are added as extra functions in the entity file.
- Reuse `createEntityClient` and the JSON helpers rather than hand-rolling `fetch`.
- **Query keys:** take TanStack Query keys from the factory in `src/utils/queryKeys.ts` (`queryKeys.resources.list()`, `queryKeys.topics.detail(id)`, …) instead of inlining string arrays — invalidation breaks silently when keys drift.
- `src/utils/fetchFunctions.ts` is a legacy shim that re-exports `./api` — import from `@/utils/api` (or the barrel) in new code.

## Forms

- Uses TanStack Form's `createFormHook` API. The `useAppForm` hook (defined in `src/hooks/useAppForm.ts`, re-exported from `src/components/formFields/index.ts`) registers context-based field components: `InputField`, `TextareaField`, `NumberField`, `RadioGroupField`, `DatePickerField`, `ComboboxField`, `MultiComboboxField`.
- Access fields via `form.AppField` — do **not** import the field components directly. They live in `src/components/formFields/` and read form state via `useFieldContext()` from `src/utils/fieldContext.ts`.
- To add a new reusable field: create the component in `components/formFields/`, register it in `hooks/useAppForm.ts`.

## Edit pages

- Shared boilerplate (skip-blocker, query invalidation, navigation, delete handler) lives in `src/hooks/useEditFormPage.ts`. All `<entity>.$id.edit.tsx` routes use it — new edit routes must too.
- Footer/unsaved-changes UI: `components/layout/EditPageFooter.tsx` + `components/UnsavedChangesDialog.tsx`.

## Loading / error / empty states

- Route-level: `<EntityPending entity="..."/>` and `<EntityError entity="..."/>` from `src/components/EntityStates.tsx`.
- Inside a `DashboardCard`: `<DashboardSectionStatus isPending error isEmpty entity="..." emptyMessage="..."/>` from `src/components/contentBoxComponents/DashboardCard.tsx` — renders pending/error/empty rows in the card body.

## Components

Organized by purpose under `src/components/`:

- `ui/` — shadcn-style primitives (add new ones via the shadcn CLI)
- Root-level primitives — `button.tsx`, `calendar.tsx`, `combobox.tsx`, `input.tsx`, `input-group.tsx`, `popover.tsx`, `radio-group.tsx`, `textarea.tsx`, `sonner.tsx`: vendored shadcn-derived files; keep edits minimal and preserve their scoped eslint-disable comments
- `layout/` — page chrome (`PageHeader`, `EditPageFooter`, `NavDropdown`, `OverviewCardGrid`, …)
- `contentBoxComponents/` / `boxElements/` — content-box cards (`ContentBox`, `DashboardCard`, the entity boxes) and their building blocks. `boxes/` still exists as a thin re-export shim for the old `@/components/boxes/*` import paths — prefer importing from `contentBoxComponents/`
- `tables/` — table components (`CoursesTable`, `TopicsTable`)
- `resources/` — resource/module components
- `dailies/`, `routines/`, `radar/`, `tasks/` — feature components ("dailies" components render the daily-tracker view of routines)
- `forms/` — field-composition primitives; `formFields/` — TanStack Form-aware fields

Theme support via ThemeProvider context (`src/hooks/useTheme.ts`, dark/light mode).

## Adding a new page

1. Create the route file in `src/routes/` following the naming conventions above.
2. Regenerate the route tree (`pnpm --filter=@emstack/client run routeTree`).
3. Edit pages: use `useEditFormPage`; loading/error placeholders: `EntityPending` / `EntityError`.
4. Add navigation in `src/routes/__root.tsx` if the page should appear in the nav.

## Testing

- Vitest + Testing Library; co-located `*.test.ts(x)` files.
- Run all: `pnpm --filter=@emstack/client test`; single file: `pnpm --filter=@emstack/client exec vitest run path/to/file.test.tsx`.
