# CLAUDE.md — @emstack/client

React 19 + Vite frontend. Read the root CLAUDE.md for commands and setup; this file covers client conventions.

## Routing

- File-based routing with TanStack Router; route files live in `src/routes/`.
- Naming: `foo.tsx` is the layout, `foo.index.tsx` the index page, `foo.$id.tsx` the dynamic-segment layout, `foo.$id.edit.tsx` a child route. Route-private components live in sibling `foo.-components/` directories (the `.-` prefix keeps them out of routing).
- `src/routeTree.gen.ts` is **generated — never edit or read it**. Regenerate with `pnpm --filter=@emstack/client run routeTree` (the vite dev server also regenerates it on save).
- Path alias: `@` → `packages/client/src`.

## Types — where they live

Two homes, by audience:

- **`@emstack/types` (`packages/types/src/`)** — the cross-package source of truth. Any shape that crosses the wire or is shared with the middleware lives here (one type per PascalCase file + barrel). Both client and middleware consume it; never re-declare a shared shape locally. See the root CLAUDE.md.
- **`@/types/` (`src/types/`)** — client-only shared types with **no runtime code**: pure type modules imported across multiple client files but never needed by the backend (e.g. `ControlledDialogProps` in `dialogProps.ts`, `EditRowBaseProps` in `editRowProps.ts`, `BaseFieldProps` in `fieldProps.ts`). Import by explicit file (`@/types/dialogProps`) — there's no barrel, to keep it from becoming a grab-bag.

**Stays put — don't move into `@/types/`:**
- Single-use component props → colocate (often non-exported) in the component file.
- Shared types tightly coupled to runtime helpers/consts → keep in their module (e.g. `DashboardTileProps`/`GridLayoutItem` in `lib/dashboardTiles.ts`, `SelectOption` in `utils/selectOptions.ts`, the context union types in `src/context/`).
- Feature-domain types → keep in the feature folder (`components/radar/`, `components/dailies/`, …).
- Types shared by several files **within one directory** but not the wider client → a local `types.ts` (or `<area>Props.ts`) in that directory is fine. `@/types/` is for genuinely client-wide types; don't promote a directory-scoped type there just to centralize it.

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
- Footer/unsaved-changes UI: `components/layout/EditPageFooter.tsx` + `components/dialogs/UnsavedChangesDialog.tsx`.

## Loading / error / empty states

- Route-level: `<EntityPending entity="..."/>` and `<EntityError entity="..."/>` from `src/components/listControls/EntityStates.tsx`.
- Inside a `DashboardCard`: `<DashboardSectionStatus isPending error isEmpty entity="..." emptyMessage="..."/>` from `src/components/contentBoxComponents/DashboardCard.tsx` — renders pending/error/empty rows in the card body.

## Components

**No component lives directly in `src/components/` — every component belongs to a themed subdirectory.** A structure test (`components/structure.test.ts`) fails the build if a loose file appears at the root, and an ESLint `no-restricted-imports` rule blocks the old root paths. New shadcn primitives land in `ui/` automatically (`components.json` `aliases.ui` → `@/components/ui`). When adding a component, drop it in the matching folder below (or a feature folder); if none fits, create a new themed subdirectory rather than a root file.

Organized by purpose under `src/components/`:

- `ui/` — shadcn-style primitives (add new ones via the shadcn CLI, which now writes here). Includes the vendored shadcn-derived files (`button.tsx`, `calendar.tsx`, `combobox.tsx`, `input.tsx`, `input-group.tsx`, `popover.tsx`, `radio-group.tsx`, `textarea.tsx`, `sonner.tsx`): keep edits minimal and preserve their scoped eslint-disable comments. Imported by direct file path (`@/components/ui/button`) — no barrel.
- `dialogs/` — shared app dialogs that compose the `ui/` `Dialog`/`AlertDialog` primitives (`ConfirmDialog`, `UnsavedChangesDialog`, `LayoutNameDialog`, `EditModalFooter`), imported by direct path like `ui/`. `dialogs/quickAdd/` holds the quick-add dialog family (`QuickAddMenu` + per-entity `QuickAdd*Dialog`, with its own `index.ts` barrel). Dialogs coupled to a single feature stay in that feature folder (e.g. `dailies/DailyStatusModal`, `resources/ModuleSuggestDialog`).
- `layout/` — page chrome (`PageHeader`, `EditPageFooter`, `NavDropdown`, `OverviewCardGrid`, `EditFormActions`, `LayoutMenuActions`, …)
- `contentBoxComponents/` / `boxElements/` — content-box cards (`ContentBox`, `DashboardCard`, the entity boxes) and their building blocks. Import boxes from `contentBoxComponents/` (the `index.ts` barrel re-exports the boxes plus the two tables, so a page rendering several imports from one module). The entity boxes (`CourseBox`, `DomainBox`, `ProviderBox`, `TaskBox`, `TopicBox`) are a deliberate cohesive card family — they share `ContentBox` and the `boxElements/` primitives — so they stay centralized here even though each has a single consuming index route (decided in #323); don't colocate them into `*.-components/`.
- `tables/` — table components (`CoursesTable`, `TopicsTable`)
- `resources/` — resource/module components
- `dailies/`, `routines/`, `radar/`, `tasks/` — feature components ("dailies" components render the daily-tracker view of routines)
- `forms/` — field-composition primitives; `formFields/` — TanStack Form-aware fields
- `utils/` — shared cva variant definitions (`badgeVariants`, `buttonVariants`)
- `listControls/` — list/index page chrome. Holds its own list-specific implementations (`EntityStates`, `ListPageControls`, `FilterOptionCount`) **and** re-exports shared chrome from `layout/` (`PageHeader`, `ViewModeToggle`, `OnboardingEmptyState`) through its `index.ts`, so a list page pulls everything from one module.
- `editPage/`, `infoCard/` — **single-import aggregator barrels** (each is an `index.ts` only): `editPage/` re-exports the entity edit-page shell (`PageHeader`, `EditForm`, `EditPageFooter`, `PageTabs`, `UnsavedChangesDialog`, …), `infoCard/` the read-only `$id.index` view sections (`InfoArea`, `InfoRow`, `ResourceLinksSection`, `YesNoDisplay`). Implementations stay in their original homes (`layout/`, `dialogs/`, `boxElements/`, …) — these barrels only re-export.

Theme support via ThemeProvider context (`src/hooks/useTheme.ts`, dark/light mode).

## Adding a new page

1. Create the route file in `src/routes/` following the naming conventions above.
2. Regenerate the route tree (`pnpm --filter=@emstack/client run routeTree`).
3. Edit pages: use `useEditFormPage`; loading/error placeholders: `EntityPending` / `EntityError`.
4. Add navigation in `src/routes/__root.tsx` if the page should appear in the nav.

## Testing

- Vitest + Testing Library; co-located `*.test.ts(x)` files.
- **Two Vitest projects** (`vite.config.ts`): `unit-tests` runs the co-located
  `*.test.ts(x)` in **jsdom** (fast); `storybook` runs every `*.stories.tsx` in a
  **real headless Chromium** via Playwright (slow — this is the bottleneck).
- Run all: `pnpm --filter=@emstack/client test`; single file: `pnpm --filter=@emstack/client exec vitest run path/to/file.test.tsx`.
- Scope by project: `… exec vitest run --project unit-tests` (fast jsdom) or
  `--project storybook` (browser). Append a path to run a single file:
  `… exec vitest run --project storybook path/to/Foo.stories.tsx`.
- **Fast inner loop:** from the repo root, `pnpm verify:changed` runs Vitest
  `related` for the files you touched — the affected jsdom unit tests **and only
  the Storybook stories that import a changed module** — instead of the whole
  browser suite. See the root CLAUDE.md "Verification — fast inner loop".
