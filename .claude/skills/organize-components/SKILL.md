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
- Precedent for subfolders: `routes/domains.$id.-components/` is split into
  `radar/` and `topicLists/`, each with an `index.ts` barrel that re-exports only
  the **public surface**; extracted internal leaves are intentionally not
  re-exported (read `domains.$id.-components/radar/index.ts` for the comment
  style).
- Shared library lives in `src/components/**` (imported via `@/components/...`).
  No component sits at the `components/` root — a `components/structure.test.ts`
  guard fails the build otherwise.

## Scope

Parse `$ARGUMENTS`:

- **A folder/route** (e.g. `/organize-components domains.$id.edit` or a full
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
- **Same-concern families** (e.g. all the radar-config pieces, all the
  domain-metadata forms).

For a large folder, delegate the read to an **Explore agent** and have it return a
grouped inventory with `file:line` references.

## Step 2 — Theme the folder into subfolders

Group the inventory into themed subfolders — one per concern. Good seams:

- container + its presentational partner → same subfolder;
- a leaf used by exactly one sibling → live beside that sibling (internal);
- two small forms that share the same parent primitives (e.g. both compose
  `EditForm` / `form.AppField`) → one `forms`/`details` subfolder.

Keep the page-level shell (the orchestrator component) and the cross-cutting tab
aggregator barrel at the folder **root**.

Move files with `git mv` to preserve history. **Co-move each `*.stories.tsx` with
its component** — the relative `./-X` import inside a story stays valid when both
land in the same subfolder, so no story edits are needed for the move:

```bash
cd 'packages/client/src/routes/<x>.-components'   # single-quote: $id is literal
mkdir -p <theme-a> <theme-b> ...
git mv -- -Foo.tsx -Foo.stories.tsx -FooPanel.tsx -FooPanel.stories.tsx <theme-a>/
```

Give each subfolder an `index.ts` barrel that exports **only the public surface**
(the component the rest of the app renders); keep presentational partners and
extracted leaves un-exported, with a comment saying so:

```ts
// Public surface of the <theme> family. -FooPanel and the extracted -FooRow are
// internal to FooContainer and intentionally not re-exported.
export { FooContainer } from "./-Foo";
```

Then fix the wiring:

- Rewrite the root aggregator barrel (e.g. `-tabs.ts`) to re-export from the new
  subfolder barrels.
- Update the route file (and any other importer) to import moved public
  components via the subfolder barrel path.
- Intra-folder relative imports between co-moved siblings are unchanged.

## Step 3 — Extract cohesive blocks (moderate)

Within the grouped components, extract the **clear** repeated or cohesive render
blocks into their own `-Leaf.tsx` files in the same subfolder — typically a
mapped list `<li>` (a row/card) or a self-contained column/section. Keep the
parent as a thin composer.

- Props mirror the per-item handlers the parent already threads through; bind the
  item key at the parent's `.map()` so the leaf takes plain `onChange`/`onRemove`.
- If a shared data type lives in the parent (e.g. `BlipDraft`, a `*Draft`
  interface), import it `import type` into the leaf — type-only imports don't
  create a runtime cycle even when the parent also imports the leaf.
- **Don't over-decompose.** Leave already-small components, containers, and the
  page shell intact. Aim for the few extractions that remove real duplication or
  shrink a >150-line render — not maximum granularity.

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

## Step 5 — A story for every component

Every component — moved or newly extracted — must have a co-located
`*.stories.tsx`. Moved components keep their existing stories; write new ones for
the extracted leaves. Follow the repo CSF3 conventions (see `/add-stories` and the
sibling stories in the same folder):

- `import type { Meta, StoryObj } from "@storybook/react-vite";`
- Use `const meta: Meta<typeof X> = { component: X, args: {...} }` when args
  include `fn()` spies (import `fn` from `storybook/test`) — `satisfies Meta` +
  `fn()` triggers TS2742, so reserve `satisfies` for spy-free metas.
- Reuse fixture factories from `@/test-utils/*Fixtures.ts` (e.g.
  `radarFixtures` → `makeTopics`/`makeQuadrants`/`makeRings`/`makeBlips`) rather
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
pnpm --filter=@emstack/client test             # unit + Storybook stories render (incl. new leaves)
```

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
