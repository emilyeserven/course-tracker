# add-stories — area notes

Per-issue worked examples for the [`add-stories`](../SKILL.md) skill — what a real
pass through each area turned up (fixtures added, tricky decorators). **Illustrative
reference, not steps to follow;** the core procedure lives in `SKILL.md`.

The `#N` headings below are this repo's story-coverage tracker sub-issues — this is
the per-tracker scratchpad, so issue numbers are expected here. Add an entry when
you finish an area.

### layout (#352)
First batch. All 12 covered components are Tier A/B — no fixtures needed.
Tier B (need `RouterStub`): `PageHeader` (renders a section `<Link>` only when
`pageSection` is set), `EntityHeaderButton`, `OnboardingEmptyState`,
`ResourceLinksSection`, `NavDropdown`, `DropdownNavItem`. `DropdownNavItem` also
needs the `DropdownMenu`/`DropdownMenuContent` parent and asserts via
`document.body`. The rest (`InfoRow`, `InfoArea`, `EditForm`, `PageTabs`,
`ViewModeToggle`, `EditPageFooter`) are Tier A with `fn()` handlers.

### ui primitives (#353)
13 new stories; no fixtures needed (inline literals only). Radix composites
(`select`, `dialog`, `alert-dialog`, `dropdown-menu`, `tooltip`, `tabs`) use a
small non-generic `*Demo` harness as `meta.component` (same trick as
`data-table.stories.tsx`'s `DataTableDemo`) — it sidesteps the multi-export Root
typing and lets spies ride in as harness props. Dialog/AlertDialog **don't export
their `Trigger`**, so drive them with a controlled `open` prop and assert content
via `within(document.body)`. Tooltip self-wraps its provider — assert
`findByRole("tooltip")` in the body. `data-table-column-header` mocks just the
`Column` methods it calls (`getCanSort`/`getIsSorted`/`getToggleSortingHandler`)
cast `as unknown as Column<unknown, unknown>`. **`toHaveStyle({ width: "30%" })`
fails** in the browser project — computed style resolves `%` to px; assert the
inline `el.style.width` string instead. `table.tsx` was left unstoried: it's
already exercised transitively by `data-table.stories.tsx`.

### formFields + forms (#354)
The 7 TanStack-Form fields (`InputField`, `TextareaField`, `NumberField`,
`RadioGroupField`, `DatePickerField`, `ComboboxField`, `MultiComboboxField`) read
`useFieldContext()`, so they need form context. Added a reusable
**`test-utils/FormFieldHarness.tsx`**: it mounts a one-field `useAppForm` and
renders the field via `form.AppField`. Import the field directly (there's **no
lint ban** — `eslint.config.js` only restricts `@emstack/types/*` subpaths) and
wrap it with the harness as a meta decorator; seed the field's value per story
via `parameters.fieldValue` (read in the decorator) so Default/Filled/… states
need no extra wiring. **Gotcha:** the harness `children` is a **render function**
(`() => ReactNode`), passed straight through as `AppField`'s render prop — a
static element hits React's same-element bailout and freezes the field on its
initial value, so interaction `play`s (typing, selecting) never update. In a
regular `.tsx` an inline parameterless function child also trips
`react/no-children-prop` ("pass it as a prop") — pass the identifier
(`{children}`), not `{() => …}` (story files are exempt via the storybook config,
but the harness isn't). Option fixtures live in `test-utils/formFieldFixtures.ts`
(`makeSelectOptions`, `makeGroupedSelectOptions`, `makeCreateConfig`). The two
presentational `formFields` (`ComboboxCreatePanel`, `ComboboxAddNewRow`) are
Tier A with `fn()` spies (`const meta: Meta<…>`). In `forms/`, `field.tsx`'s
primitives are pure Tier A; `CourseFields` takes a whole `form`, so its story uses
a tiny inline wrapper that builds the form and casts it
(`as unknown as ReturnType<typeof useAppForm>`, mirroring the onboarding route)
and types the meta against the wrapper to keep the required `form` out of args.

### resources (#355)
All 10 covered. New fixture file `test-utils/resourceModulesFixtures.ts`
(`makeTag`/`makeTagGroup`/`makeTagGroups`/`makeModule`/`makeModuleGroup`/
`makeInteraction`, defaults keyed to `resourceId: "resource-1"`). Reuse the
draft factories from `resources/moduleDrafts` (`emptyGroupDraft`, `groupToDraft`,
`emptyModuleDraft`, `moduleToDraft`) for the edit-card drafts — don't hand-roll.
Tier A (no decorator): `OptionalSelectField`, `LevelTriad`, `ModuleDisplayRow`
(host in a `<ul>`), `LevelAndTagsFields`, `GroupEditCard`, `ModuleEditCard` — the
last three pull in `TagPicker` (Base UI `Combobox`), which is self-contained, so
just don't open the combobox in `play`. Tier B: `InteractionQuickLog` +
`ModuleSuggestDialog` need only a bare `QueryStub` (mutations, no reads — don't
fire the submit so the real network mutation never runs); `ModuleSuggestDialog`
is a Radix `Dialog` so set `open: true` and assert via `within(document.body)`.
`ResourceInteractionsLog` and `ResourceModulesAdmin` read through hooks
(`useInteractionsLog` / `useResourceModules`), so seed a `QueryClient`
(`staleTime: Infinity`) for their keys — interactions/moduleGroups/modules, plus
`tagGroups.list()` and `resources.detail()` for the admin — and pass it as the
`QueryStub client`. Neither renders a `<Link>` (plain `<a>`), so no `RouterStub`.

### routines (#356)
All 5 covered. New fixture file `test-utils/routinesFixtures.ts`
(`taskOptions`/`resourceOptions` `SelectOption[]`, `taskNames`/`resourceNames`
id→name maps, `makeReferenceItem`, `makeRoutineTemplate`) — the existing
`boxFixtures.makeRoutine` is the content-box `Routine` shape, not the
`RoutineReferenceItem`/`RoutineTemplate`/`SelectOption` shapes these editors use.
Build `WeeklyRow[]` from the exported `weeklyToRows(weekly)` helper rather than
hand-rolling row literals. Tier B all round: `RoutineEntryLabel` renders an
`EntityLink` → `RouterStub` (assert with `findBy*`). `WeeklyScheduleField`,
`WeeklyEntryEditor`, and `RoutineTemplateEditModal` **unconditionally** mount
`QuickAddResourceDialog` (`useNavigate` + `useQueryClient` + `useMutation`), so
they need `RouterStub > QueryStub` even when the dialog stays closed. The modal is
a Radix `Dialog` → set `open: true` and assert via `within(document.body)`.
`TaskResourceComboboxContent` is a base-ui combobox popup: it portals and renders
only inside an **open** `Combobox` root, so wrap it in a decorator that reads
`ctx.args.optionsMap` for the root's `items` and sets `defaultOpen`, then assert
in `document.body`.

### tasks (#357)
All 9 `components/tasks/*` stored. Added **`test-utils/tasksFixtures.ts`**
(`makeTaskResource`, `makeTaskTodo`, `makeModule`, `makeModuleGroup`,
`makeTagGroup`); the `Task` shell reuses `boxFixtures.makeTask` with a
`resources`/`todos` override. Tiers: `LevelBadge`/`TagChip` pure Tier A
(`satisfies`); `TagPicker`/`TagsInput`/`ResourceLinksPicker` are presentational
with `fn()` spies (`const meta`) — the two Combobox pickers need no provider, a
`max-w-sm` sizing wrapper is enough, and `TagsInput`'s add-tag `play` types
`"graphql{Enter}"` and asserts the `onChange` spy. The `<tr>` rows
(`TaskResourceRow`, `EditingRow`) need a `<table><tbody>` decorator;
`TaskResourceRow` also renders an `EntityLink` so it wraps in `RouterStub` →
assert with `findBy*`. `ResourcesTable` drives the `useTaskResources` hook
(three `useQuery`s + a mutation) and renders linked rows, so it nests
`RouterStub > QueryStub` with a module-level `QueryClient` seeded
(`setQueryData`) for `queryKeys.resources.list()`, `["module-groups-all"]`,
`["modules-all"]` at `staleTime: Infinity` so nothing refetches. `TodosChecklist`
only needs `QueryStub` (it calls `useQueryClient`/`useMutation`, no reads).
`ResourceLinkInput` in `ResourceLinksPicker` is a non-exported local interface —
`Meta<typeof X>` checks the `value` literals structurally, so no export needed.

### route-private (#363)
All `routes/*.-components/*` leaves covered (dashboard 16, settings 11, the three
remaining `domains.$id.edit`, routines-edit 5, routines.$id 2, routines.tracker 1,
topics.$id.edit 1). The issue's per-folder counts were a stale snapshot —
`domains.$id.edit` was already 8/11 stored, so re-inventory before starting. New
fixtures: **`dashboardFixtures.ts`** (`makeTile(tileId, overrides)` →
`DashboardLayoutTile`), **`settingsFixtures.ts`** (`makeAppSettings`,
`makeTaskType`, `makeCalendarFeed`, `makeLayout`), **`templatesFixtures.ts`**
(`makeCriteriaTemplate` only — routine templates already live in
`routinesFixtures.makeRoutineTemplate`; don't re-add). Key patterns:
**Dashboard tiles** take `DashboardTileProps` (`tile` + `onUpdateTile`) but
**self-fetch**, so they're Tier B not Tier A: nest `RouterStub > QueryStub` and
seed each tile's key (`["domains"]`, `["resources"]`+`["dailies"]`, `["providers"]`,
…) on a `staleTime: Infinity` client. **Integration tiles**
(`-DashboardReadwise`/`-DashboardTodoist`/`-DashboardGoogleCalendar`) cover both
branches without fabricating full API payloads: seed `{ configured: false, …[] }`
for the connect-prompt and `{ configured: true, …[] }` for the configured-empty
state — `setQueryData` on an untyped/`as const` key takes a plain object, so no
payload-type import. `-DashboardChangelog` is pure render-only (build-time
`@root/CHANGELOG.md`, no decorators). **`-DashboardDailiesBody`** and
**`-TrackerTables`** take a whole hook-return bundle (`DashboardDailiesData` /
`RoutineTrackerState`): build it inline and cast `as unknown as <T>`, stubbing
`mutation` as `{ isPending: false, mutate: fn() }`. **Route-shell-like leaves**
(`-ExistingDomainEditor`, `-TopicForm`) are storied by seeding their `useEditFormPage`
+ list queries plus a loading/unseeded variant — `useEditFormPage`'s detail query
is `enabled: !isNew`, so the `isNew`/New story skips the detail seed.
`-ThemeSection` needs `ThemeProvider` (`@/context/ThemeProvider`). `useSettings`
needs `SettingsProvider` but never fetches (local state), so no seeding. Watch
ambiguous `getByText`: "Weekly Schedule" (Type-tile value **and** schedule header)
and "Cost per Unit" (card title **and** column header) both match twice — assert on
a unique `role`/`tab`/count signal instead.
