---
name: organize-components
description: >-
  Organize a route's flat *.-components/ folder into themed subfolders (one per
  editor/feature concern, each with its own index.ts barrel), extract clearly
  cohesive/repeated render blocks into their own files, add a Storybook story for
  every component (CSF3, no play functions), and flag duplicates against shared
  components/. Use when asked to "organize components", "sort components into
  subfolders", "group components by theme", "add subfolders to a -components
  folder", or via /organize-components. Accepts an optional folder/route to
  scope. Pairs with check-components (placement audit), condense-components
  (dedupe), and add-stories (coverage).
---

# Organize components (course-tracker)

Take a route-private `*.-components/` folder that has grown into a flat pile of
files and **organize it**: group cohesive components into themed subfolders with
`index.ts` barrels, extract the obvious repeated/cohesive render blocks into their
own components, give every component a Storybook story, and **flag** (don't merge)
anything that duplicates a shared `components/` component.

This skill **does** move files and write code (it reorganizes one folder). It does
**not** auto-merge duplicates, rewrite cross-route call sites, or condense types —
those are handed off (`condense-components`, `condense-types`).

## The convention (see `packages/client/CLAUDE.md`)

- Route-private components live in a sibling `*.-components/` folder; the `.-`
  prefix keeps them out of TanStack routing. Component files keep a leading `-`
  (e.g. `-DetailsTab.tsx`) **inside subfolders too**.
- Precedent for subfolders: `routes/dashboard/-components/` is split into
  `layout/` and `dashboardCards/`, each with an `index.ts` barrel that re-exports only
  the **public surface**; extracted internal leaves are intentionally not
  re-exported (read `dashboard/-components/index.ts` for the comment
  style).
- Shared library lives in `src/components/**` (imported via `@/components/...`).
  No component sits at the `components/` root — a `components/structure.test.ts`
  guard fails the build otherwise.

## Scope

Parse `$ARGUMENTS`:

- **A folder/route** (e.g. `/organize-components routines/$id/edit` or a full
  `packages/client/src/routes/<x>.-components` path) → organize that folder.
- **Empty** → ask which `*.-components/` folder to organize, or list candidates:
  ```bash
  ls -d packages/client/src/routes/*.-components 2>/dev/null
  ```

Assume `pnpm install` has run. Paths below are relative to the repo root.

## Step 1 — Inventory the folder

List every file and, for each component, note: what it renders, its props, and
what it imports/renders. Identify:

- **Container ↔ presentational pairs** (a stateful tab that renders one
  presentational panel — these belong together).
- **Shared-parent groups** (components only ever rendered by one other component
  in the folder).
- **Same-concern families** (e.g. all the dashboard-layout pieces, all the
  routine-template forms).

For a large folder, delegate the read to an **Explore agent** and have it return a
grouped inventory with `file:line` references.

## Step 2 — Theme the folder into subfolders

Group the inventory into themed subfolders — one per concern. Good seams:

- container + its presentational partner → same subfolder;
- a leaf used by exactly one sibling → live beside that sibling (internal);
- two small forms that share the same parent primitives (e.g. both compose
  `EditForm` / `form.AppField`) → one `forms`/`details` subfolder;
- a leaf, hook, or util used by **more than one** theme (e.g. a `-cardKit` of
  shared card primitives) → a **`shared/`** subfolder, imported by siblings via
  `../shared/-x`. Don't duplicate it into each theme.

Keep the page-level shell (the orchestrator component) and the folder's
**public-API modules** — the root aggregator barrel (`index.ts`) and any registry
the route reads (e.g. a `-tileComponents.tsx` id→component map) — at the folder
**root**. Preserving these means **nothing outside the folder changes**; only the
folder's single route consumer (and the registry's internal imports) move to the
new subfolder paths.

Move files with `git mv` to preserve history. **Co-move each component's whole
co-located family** — its `*.stories.tsx`, `*.test.ts(x)`, and any private
`-useX.ts` hook / `-x.ts` helper — into the same subfolder. The relative `./-X`
imports between co-moved siblings stay valid, so those files need no edits for the
move:

```bash
cd 'packages/client/src/routes/<x>.-components'   # single-quote: $id is literal
mkdir -p <theme-a> <theme-b> shared ...
git mv -- -Foo.tsx -Foo.stories.tsx -Foo.test.ts -useFoo.ts <theme-a>/
```

Give each subfolder an `index.ts` barrel that exports **only the public surface**
(the components the rest of the app renders); keep presentational partners,
extracted leaves, hooks, and helpers un-exported, with a comment saying so:

```ts
// Public surface of the <theme> family. -FooPanel and the extracted -FooRow are
// internal to FooContainer and intentionally not re-exported.
export { FooContainer } from "./-Foo";
```

(A pure-`shared/` subfolder consumed only via direct `../shared/-x` paths needs no
barrel — add one only if several files import the same public set from it.)

Then fix the wiring:

- Rewrite the root aggregator barrel (e.g. `-tabs.ts` / `index.ts`) and any
  registry to re-export / import from the new subfolder barrels — keeping their
  **public export names identical** so external consumers are untouched.
- Update the route file (and any other importer) to import moved public
  components via the subfolder barrel path.
- Intra-folder relative imports between co-moved siblings are unchanged;
  cross-theme imports become `../<other-theme>/-x` (or `../shared/-x`).

## Step 3 — Extract cohesive blocks (moderate)

Within the grouped components, extract the **clear** cohesive pieces into their own
files in the same subfolder, keeping the parent a thin composer. Three kinds:

- **Render blocks → `-Leaf.tsx`** — typically a mapped list `<li>` (a row/card) or
  a self-contained column/section. Props mirror the per-item handlers the parent
  already threads through; bind the item key at the parent's `.map()` so the leaf
  takes plain `onChange`/`onRemove`.
- **Pure logic → `-x.ts`** — row/value builders, table column definitions, layout
  math, formatting. A big card is often mostly non-JSX (e.g. a 610-line card → a
  `-xRows.ts` builder + `-xColumns.tsx` defs + a thin shell). Pulling this out
  shrinks the component **and** makes the logic unit-testable in isolation.
- **Stateful / data-prep logic → `-useX.ts` hook** — when a large component spends
  most of its body deriving state (queries, memos, transforms) before rendering,
  lift that into a co-located hook so the component becomes a slim orchestrator
  (e.g. a 487-line chart → a `-useXData` hook + a ~234-line orchestrator + leaves).

Shared notes:

- **Unify near-identical siblings.** If two blocks differ only by their data
  (e.g. an "adopted" vs "ignored" strip), extract **one** parameterized leaf and
  render it twice with different props rather than two near-copies.
- If a shared data type lives in the parent (e.g. a `*Draft`
  interface), import it `import type` into the leaf — type-only imports don't
  create a runtime cycle even when the parent also imports the leaf.
- **Don't over-decompose.** Leave already-small components, containers, and the
  page shell intact. Aim for the few extractions that remove real duplication,
  shrink a >150-line render, or isolate testable logic — not maximum granularity.

## Step 4 — Check shared `components/` for duplicates (flag only)

Surface route-private components that duplicate something already shared, so the
sort doesn't entrench a fork:

```bash
pnpm exec fallow dupes --format json   # run from repo ROOT
grep -rn "<ControlName>" packages/client/src/components --include=*.tsx
```

Look especially for a hand-rolled control that overlaps a shared primitive or
field — e.g. a bespoke multi-select vs `components/formFields/MultiComboboxField`,
or a hand-built element that a `components/ui/` primitive already provides. Read
**both** files before flagging (structural similarity ≠ semantic equivalence;
drafts and route-specific variants can look alike on purpose).

**Report, don't merge.** List each duplicate as `current → shared` with the
evidence, and hand off the actual consolidation to `/condense-components` (and
`/condense-types` for the prop-shape half). Do not rewrite call sites in this
pass — a structural sort that also silently changes behavior is hard to review.

## Step 5 — A story for every component, a test for every extracted helper

Every component — moved or newly extracted — must have a co-located
`*.stories.tsx`; every extracted **pure-logic** module (`-x.ts` from Step 3) gets
a co-located `*.test.ts`. Stories cover rendering; unit tests cover the logic that
was previously buried in a component and untestable. Moved files keep their
existing stories/tests; write new ones for the new leaves and helpers. Follow the
repo CSF3 conventions (see `/add-stories` and the sibling stories in the folder):

- `import type { Meta, StoryObj } from "@storybook/react-vite";`
- Use `const meta: Meta<typeof X> = { component: X, args: {...} }` when args
  include `fn()` spies (import `fn` from `storybook/test`) — `satisfies Meta` +
  `fn()` triggers TS2742, so reserve `satisfies` for spy-free metas.
- Reuse fixture factories from `@/test-utils/*Fixtures.ts` (e.g.
  `tasksFixtures` → `makeTaskTodo`/`makeTagGroup`) rather
  than hand-rolling literals. Mirror the args the sibling container story already
  builds.
- Add decorators only when the component needs them: a `<ul>` wrapper for a leaf
  that renders an `<li>`; `routerDecorator`/`queryStubDecorator` from
  `@/test-utils/storyDecorators` for `<Link>`/query-coupled components.
- **No `play` functions.** Do not import `within`/`userEvent`/`expect`. Stories
  are render-only.

## Step 6 — Wire up & verify

```bash
pnpm --filter=@emstack/client run routeTree   # the .- prefix keeps subfolders out of routing; confirm no route diff
pnpm typecheck                                 # moved/extracted imports resolve
pnpm lint                                      # barrels + import/max-dependencies stay green
pnpm --filter=@emstack/client test             # unit tests + Storybook story smoke-renders (incl. new leaves/helpers)
```

`vitest` (above) runs the stories via the Storybook vitest project, so it
validates the new stories. **Don't rely on `build-storybook`** to verify — it can
fail on `master` for unrelated pre-existing reasons (e.g. `MISSING_EXPORT` in
files this change doesn't touch); typecheck + the vitest run are the real gate.
Confirm `git status` shows the moves as **renames** (history preserved).

## Guardrails

- Never edit or read `routeTree.gen.ts` (generated).
- Keep the leading `-` on component filenames inside subfolders; keep `index.ts`
  barrels exporting only the public surface.
- **Flag, don't merge** duplicates against shared `components/`; never rewrite
  cross-route call sites here.
- If a duplicate genuinely belongs in shared `components/`, remember the
  `structure.test.ts` rule — it must land in a themed subdirectory, never the
  `components/` root.
- No play functions in generated stories.
- Pairs with: `/check-components` (placement audit), `/condense-components` &
  `/condense-types` (dedupe), `/add-stories` (wholesale coverage gaps).
