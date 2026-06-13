---
name: reduce-imports
description: >-
  Bring a file (or folder) under the `import/max-dependencies` ESLint warning
  (threshold 10) by grouping cohesive sibling modules into sub-barrels and
  extracting logic-heavy hooks — without changing behavior. Use when asked to
  "reduce imports", "fix max-dependencies", "too many imports/dependencies in
  this file", or to resolve an issue under the import/max-dependencies cleanup
  tracker (#312).
---

# Reduce imports (course-tracker)

`pnpm lint` warns on `import/max-dependencies` for many files in
`packages/client`. The cleanup is tracked in **#312**, split into per-area
issues (dailies, resources, routines, routes, …). This skill is the repeatable
procedure for one such area. Quality only — behavior must not change. For
behavior cleanups use `/simplify`; for bugs use `/code-review`.

## How the rule actually counts (read this first)

Config: `@emilyeserven/eslint-config/configs/import.js` →
`"import/max-dependencies": ["warn", { max: 10, ignoreTypeImports: true }]`.

- It counts **distinct source modules** (import *paths*), **not** named imports.
  `import { a, b, c } from "x"` is **one** dependency.
- **Type-only imports don't count** (`ignoreTypeImports: true`). `import type {…}`
  is free.
- Two statements from the same module count **once**
  (`import x` + `import type {X}` from `"./x"` = 1). `import/no-duplicates`
  will tell you to merge them anyway.

So before restructuring, do the cheap wins:
- Convert imports used **only as types** to `import type` (or inline
  `import { type Foo }`) — they drop off the count entirely.
- Then count only the remaining **value** imports. You need that number ≤ 10.

```bash
# Which files are flagged (this is also the acceptance check):
pnpm lint 2>&1 | grep -B40 "Maximum number of dependencies" | grep -E "^/|max-dependencies"
```

## Strategy, in order of preference

### 1. Group cohesive sibling sub-components into a dedicated sub-barrel
A component that imports 8–10 siblings from the same feature folder collapses to
**one** import. Create a small, **purpose-named** barrel (e.g.
`dailyCells.ts`, `completionControls.ts`) that `export { … } from "./X"` the
leaf modules. Consumers import from the sub-barrel; **the leaf sub-components
keep their own direct `./X` imports**.

**Circular-dependency rule (the trap the issues call out):** do **not** import
the folder's own `index.ts` from inside the same folder, and never have a
barrel re-export a module that imports that barrel. A sub-barrel that only
re-exports *leaf* components (ones that don't import the barrel) is safe.
`pnpm exec fallow dead-code` reports circular dependencies — run it after.

Keep barrels **cohesive**, not grab-bags: split by role (e.g. row-display cells
vs. entry-editing controls) rather than dumping every sub-component into one
file. Prefer 1–2 small barrels per consumer over a single junk-drawer.

### 2. Extract a logic-heavy hook
When a component is large and pulls in `@tanstack/react-query`,
`sonner`/`toast`, data helpers from `@/utils`, and other hooks just to compute
state, move that logic into a `use…` hook under `src/hooks/`. The hook absorbs
those imports; the component is left rendering JSX from a
presentational-ready return value.

Mirror the existing bundled-hook pattern:
- `hooks/useResourceModules.ts` — rich `{ data…, mutations…, handlers… }` return.
- `hooks/useDailyTracker.tsx`, `hooks/useDailyCompletions.ts` — feature hooks
  returning pre-derived rows + action callbacks. Return *computed* values
  (formatted labels, `canGoNext`, per-row flags) so the component imports no
  helpers itself.

### 3. Last resort — scoped disable for genuine barrels
Some files legitimately re-export everything (`utils/index.ts`,
`utils/api/index.ts`). Those carry a top-of-file
`/* eslint-disable import/max-dependencies -- <reason> */`. Only use this for a
real barrel/aggregator, never to dodge restructuring a component.

## Guardrails (don't break behavior to win the count)

- **Don't swap inline markup for a similar existing component** unless it's
  truly equivalent. The dailies row files inline a recent-days strip; the
  `DailyRecentDaysStrip` component looks similar but renders different
  table/list markup — reusing it would change behavior. Group the imports; keep
  the markup.
- **Keep public props identical** so `*.stories.tsx` and tests keep passing.
- **Merge same-module imports** into one statement (`import/no-duplicates`).
- **Don't hand-fuss import ordering** — lint-staged + the on-save formatter
  reorder them (in this project, sibling `./` imports sort *after* `@/`
  imports). Just run the formatter / `--fix`.
- Move stale suppression comments with their code; delete ones made obsolete by
  the refactor (e.g. a `fallow-ignore code-duplication` note on an import block
  that's now a single barrel import).
- **Skip generated files**: `routeTree.gen.ts`, anything under `dist/`.

## Verify

```bash
# Acceptance: the target files no longer appear
pnpm lint 2>&1 | grep -B40 "Maximum number of dependencies" \
  | grep -E "^/|max-dependencies" | grep -E "<your file names>" \
  || echo "PASS"

pnpm typecheck
pnpm --filter=@emstack/client exec vitest run            # or scope to changed dirs
pnpm exec fallow dead-code                                # reports new cycles
```

When spot-linting individual files, run `eslint` from the **repo root** (or via
`pnpm lint`). Invoking `pnpm --filter=@emstack/client exec eslint <file>`
directly makes `better-tailwindcss/no-unknown-classes` falsely error with
"No tailwind css entry point found" — that's a cwd artifact, not a real
problem. If you must scope it, add `--rule '{"better-tailwindcss/no-unknown-classes":"off"}'`.

Commit with a `refactor(<scope>):` Conventional Commit (e.g.
`refactor(client): reduce imports in dailies components`). Splitting the
sub-barrel extraction and the hook extraction into separate commits reads
better.

## Area notes: app shell & quick-add dialogs (#311)

Worked counts (non-type value imports): `routes/__root.tsx` = **12** (shed 2);
`components/quickAdd/QuickAddRoutineDialog.tsx` = **11** (shed 1);
`QuickAddTodoistDialog.tsx` = **11** (shed 1). Both dialogs cleared the line via
Strategy 2 (a per-dialog bundled hook); `__root` used Strategy 1 (a folder
barrel) **plus** Strategy 2 (a query hook).

### `queryKeys` is NOT in the `@/utils` barrel
`@/utils/queryKeys` is imported as its own line everywhere — it is deliberately
**not** re-exported from `utils/index.ts`. So `@/utils` + `@/utils/queryKeys` are
always two distinct sources you can't merge. The only way to drop the
`queryKeys` line from a component is to move the query/mutation logic that uses
it into a hook (Strategy 2). Don't try to "fix" this by adding it to the barrel —
that bloats the barrel's own dep count and fights the convention.

### Preserve query keys verbatim when extracting a query hook
Keys in this repo are inconsistent by accretion — some use the factory
(`queryKeys.resources.list()`), some are inline arrays (`["topics"]`,
`["providers"]`, `["domains"]`). When you lift `useQuery` calls into a hook
(e.g. `useShowOnboard` pulling the four onboarding fetches out of `__root`),
**copy each key exactly as-is**. "Tidying" an inline array into a factory call
while extracting silently breaks invalidation elsewhere that still uses the old
key. Behavior-preserving means key-preserving.

### Per-dialog bundled hook — the big collapse
A quick-add dialog drags in `react` (`useState`/`useEffect`) +
`@tanstack/react-query` (`useMutation`/`useQuery`/`useQueryClient`) +
`@tanstack/react-router` (`useNavigate`) + `sonner` + `@/utils` (the create fn) +
`@/utils/queryKeys` — **six** sources — purely to run one form+mutation. Fold all
of it into one `use…` hook returning a presentational-ready object
(`{ name, setName, mode, setMode, handleSubmit, isPending, canSubmit }`, with
`handleSubmit` owning `preventDefault` + trim-guard + `mutate`). The component is
left importing only render deps (a `lucide` icon, the form primitives,
`ui/button`, `ui/dialog`, the hook — and a `<Link>` if the JSX still navigates).

- **Placement:** the established home is `src/hooks/` (matches `useResourceModules`,
  `useDailyTracker`). A hook used by exactly one dialog may co-locate next to it
  (`components/quickAdd/useQuickAddRoutine.ts`) and stay **out** of the feature
  barrel — it's internal, not public surface. Either is fine; default to
  `src/hooks/` unless the hook is single-consumer and feature-private.
- `react`/`useState` only leaves the component if **all** its uses leave. In
  `__root` the `activeQuickAdd` state stays, so `react` stays — don't count it as
  shed.

### Folder barrel where none exists yet (Strategy 1, app-shell flavor)
`__root` imported two nav primitives by full path
(`@/components/layout/DropdownNavItem`, `…/NavDropdown`). There was no
`components/layout/index.ts`, so creating a cohesive one (export just the nav
set, not all ~13 layout files) merged them to a single `@/components/layout`
import. A barrel only pays off at ≥2 sources sharing a folder; re-exporting one
component buys nothing.

## Learnings: route layout + sections (settings, #308)

- **A route layout that renders N route-private sections → barrel the folder.**
  `foo.tsx` importing 10 `<XSection/>` from `foo.-components/-XSection.tsx`
  collapses to one import via a `foo.-components/index.ts` that
  `export { XSection } from "./-XSection"` for each. The un-prefixed `index.ts`
  is **router-safe** — the `.-` on the *folder* already excludes the whole
  directory from routing, so the barrel never becomes a route. Confirm with
  `pnpm --filter=@emstack/client run routeTree` (expect no diff). Generalizes
  #337's `dashboard.-components/index.ts`. Keep it cohesive: re-export just the
  route's own sections (stops at exactly the section count — no disable needed)
  rather than also folding in `@/components/*` chrome, which would push the
  barrel over 10 and force a scoped disable on it.

- **Colocate a route-private hook as `-use*.ts` inside the `.-components/`
  folder**, not `src/hooks/`, when only that route uses it (precedent:
  `dashboard.-components/-useDashboardDailies.ts`). Reserve `src/hooks/` for
  genuinely cross-route hooks (`useResourceModules`, `useEditFormPage`).

- **When extracting a hook, move the UI state its mutations reset.** Mutation
  `onSuccess` commonly calls component `setState` (close a dialog, clear a
  `*TargetId`/`creatingKind`). Move that state **into the hook** alongside the
  mutations and return `open*/close*/submit*` handlers plus `is*Pending` flags —
  otherwise the hook can't reset it and you'd have to thread setters back in.
  (`-useDashboardLayouts` owns its dialog-target + `creatingKind` state for
  exactly this reason.)

- **One hook can serve a parent + child split.** A section that's a thin
  fetch-wrapper around a form child: call the data/mutation hook once in the
  parent and pass the mutation **down as a prop**, rather than re-calling the
  hook (and re-importing react-query/utils) inside the child. (`FocusedDomains`:
  `useFocusedDomains()` in the section, `saveMutation` passed to the form.)

- **`lucide-react` is already one dependency** — multiple icons from it are one
  import line, so "consolidate the icons" advice is a no-op for the count. Look
  for whole *modules* to shed (react-query, sonner, `@/utils/api`,
  `@/utils/queryKeys`), which a hook absorbs in one move.
