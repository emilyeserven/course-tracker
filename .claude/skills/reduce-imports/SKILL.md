---
name: reduce-imports
description: >-
  Bring a file (or folder) under the `import/max-dependencies` ESLint warning
  (threshold 10) by grouping cohesive sibling modules into sub-barrels and
  extracting logic-heavy hooks — without changing behavior. Use when asked to
  "reduce imports", "fix max-dependencies", "too many imports/dependencies in
  this file", or to resolve an issue under the import/max-dependencies cleanup
  tracker.
---

# Reduce imports (course-tracker)

`pnpm lint` warns on `import/max-dependencies` for many files in
`packages/client`. The cleanup is tracked in an **import/max-dependencies
cleanup tracker** issue, split into per-area issues (dailies, resources,
routines, routes, …). This skill is the repeatable procedure for one such area.
Quality only — behavior must not change. For behavior cleanups use `/simplify`;
for bugs use `/code-review`.

> _Hooks, files, and components named below (e.g. `useResourceModules`,
> `DailyRecentDaysStrip`) are illustrations — they show the **shape** of a fix,
> not required targets. Apply the method to whatever's in your scope. Per-area
> worked examples and learnings live in `references/area-notes.md` — illustrative
> reference, not core procedure._

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

Mirror the existing bundled-hook pattern — for example:
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
  truly equivalent. Example: the dailies row files inline a recent-days strip;
  the `DailyRecentDaysStrip` component looks similar but renders different
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
better. Check off the area's issue under the cleanup tracker and record anything
learned in `references/area-notes.md`.
