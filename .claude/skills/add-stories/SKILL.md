---
name: add-stories
description: >-
  Add Storybook stories for React components that lack them in
  packages/client, following this repo's CSF3 conventions (Meta/StoryObj,
  storybook/test play smoke tests, test-utils fixture factories,
  RouterStub/QueryStub decorators). Use when asked to "add/write storybook
  stories", "cover this component in storybook", "story coverage", "missing
  stories", or to resolve an area under the story-coverage tracker.
  Pairs with `condense-components` — that skill stories the components it
  extracts; this one fills coverage gaps wholesale.
---

# Add stories (course-tracker)

Write co-located `*.stories.tsx` for components that don't have one yet, so they
render in Storybook and run as browser interaction tests under the `storybook`
vitest project (the CI gate). **Story-only — no behavior changes** to the
components themselves. The one exception is route shells (Tier C below), where
the prescribed move is a behavior-preserving *extract* before storying.

Coverage is tracked in a **story-coverage tracker** issue, split into per-area
sub-issues (formFields, layout, resources, routes, …) — same model as the
import/max-dependencies cleanup tracker. This skill is the repeatable procedure
for one such area.

Stories already exist for ~40-50% of components; whole areas are done
(`contentBoxComponents/`, `boxElements/`, `dailies/`, `radar/`, `tables/`). Don't
re-story those. The shared infra is already in place — reuse it, don't reinvent.

> _Components, files, and fixtures named below (e.g. `InfoRow`,
> `-ResourcesList.stories.tsx`, `useResourceModules`) are illustrations — they
> show the **shape** of the pattern, not required targets. Apply the method to
> whatever's in your scope. Per-area worked examples (fixtures added, tricky
> decorators) live in `references/area-notes.md` — illustrative reference, not
> core procedure._

## 1. Inventory the target area — what's actually uncovered

Story files are **co-located** next to the component and a story's filename
**need not match** its component file (e.g. `radarLegendItem.tsx` →
`BlipLegendItem.stories.tsx`). So don't audit by filename match alone — grep each
component's export for a referencing story. A quick first pass for a folder:

```bash
cd packages/client/src/components/<area>
for f in *.tsx; do case "$f" in *.stories.tsx) ;; *) \
  [ -f "${f%.tsx}.stories.tsx" ] || echo "missing: $f";; esac; done
```

Then confirm the "missing" ones really lack coverage (a sibling story may render
them) before writing:

```bash
grep -rln "import .*{ *<ComponentName> *}" packages/client/src --include='*.stories.tsx'
```

For a wide sweep across the app, delegate to an **Explore agent** to map
component → story coverage by feature folder.

## 2. Classify each component into a tier (read its imports)

Open the file and look at what it imports/calls — that dictates the decorators.

- **Tier A — pure / presentational.** Props in, render out. No router, no query,
  no context hooks. Just JSX + `ui/` primitives. (e.g. `InfoRow`, `InfoArea`,
  `EditForm`, `PageTabs`, `ViewModeToggle`, `EditPageFooter`.) → no decorator, or
  a sizing/host wrapper only.
- **Tier B — context-coupled.** Renders a TanStack `<Link>` (often
  transitively — a legend/table/chart that renders a link counts), or calls
  `useQuery`/`useMutation`/`useQueryClient`, reads settings, uses a Radix
  primitive that needs its provider/parent (Tooltip, DropdownMenuItem), or a
  TanStack Form field. → wrap in the matching decorator(s) (§3).
- **Tier C — route shell.** A `routes/*.tsx` file. Its component is defined
  **inline and not exported** (only `Route` is), and it calls `useQuery` with a
  real network `queryFn` plus `Route.useSearch()`/`useLoaderData()`. → see §4;
  don't try to render the shell directly.

## 3. Author the story (the canonical pattern)

Mirror `components/ui/Badge.stories.tsx` (Tier A) and
`routes/resources.-components/-ResourcesList.stories.tsx` (Tier B). Rules:

- **CSF3:** `import type { Meta, StoryObj } from "@storybook/react-vite";`
- **Test helpers from `storybook/test`** — the bare package, **NOT**
  `@storybook/test`. Storybook 10 dropped the scoped package; importing it can
  pass a local run with stale `node_modules` but **CI fails** with
  `Cannot find module '@storybook/test'`. Available: `within`, `screen`,
  `expect`, `fn`, `userEvent`, `waitFor`.
- **Default `args` on `meta`**; variants as named exports (`Default`, `Empty`,
  `WithProgress`, …). Cover meaningful states, not every prop permutation.
- **`play` smoke test.** Give at least `Default` a `play` that asserts on
  rendered output. A render-only story (no `play`) still smoke-tests that it
  mounts — fine for heavy containers, but prefer one assertion.
- **`meta` typing:** use `const meta: Meta<typeof X> = {…}` (explicit
  annotation) whenever any arg is a `fn()` spy — the inferred type embeds the
  `@vitest/spy` Mock type and isn't portable (TS2742). Use
  `} satisfies Meta<typeof X>;` only when there are no spies. If `meta`
  references a prop whose interface isn't exported, export it (TS4023).
- **Async handler args:** `fn(() => Promise.resolve())`, not `fn(async () => {})`
  (trips `no-empty-function`).
- **Mock data from fixtures.** Use the `make*` factories in
  `src/test-utils/*Fixtures.ts` (`boxFixtures`, `dailiesFixtures`,
  `radarFixtures`) — `makeResource`, `makeDaily`, `makeBlip`, `makeTopics`, … —
  with partial overrides. Extend a factory rather than hand-rolling literals. If
  an area has no factory yet and you're writing several stories, add a
  `test-utils/<area>Fixtures.ts` instead of duplicating args per story.

## 4. Decorators by need (all per-component in `meta.decorators` — no globals)

There are **no global decorators** in `.storybook/preview.ts`, and don't add any
(an async router mount would break existing sync `play`s). Wrap per story.

- **Router `<Link>`** → `RouterStub` from `@/test-utils/RouterStub` (memory
  router, context-only; navigation is a no-op — assert on output, not URLs). It
  mounts children **after** the router's initial load, so assert with async
  `findBy*`, not `getBy*`.
- **Query hooks** → `QueryStub` from `@/test-utils/QueryStub`. For a component
  that *reads* via `useQuery`, build a `QueryClient`, seed it with
  `setQueryData(queryKeys.…, data)` (keys from `@/utils/queryKeys`), and pass it
  as the `client` prop so the component sees data without a network call.
- **Settings** → `SettingsProvider` from `@/context/SettingsProvider`.
- **Tooltips** → `TooltipProvider` from `@/components/ui/tooltip`.
- **Radix menu items** (`DropdownMenuItem` and friends) need their menu context:
  wrap in `<DropdownMenu open><DropdownMenuContent forceMount>…</…>`. The content
  **portals to `document.body`**, so assert with `within(document.body)` /
  `screen`, not `canvasElement`.
- **Host-element fragments** → supply the parent: SVG `<g>`/`<circle>` in
  `<svg>`, `TableRow` in `<Table><TableBody>`. Give width-dependent components a
  sizing wrapper (`<div className="max-w-sm">`).
- **Persisted UI state** (localStorage view-mode etc.) → reset in
  `beforeEach: () => window.localStorage.clear()`
  (see `-ResourcesList.stories.tsx`).

Compose decorators by nesting (outermost first), e.g.
`RouterStub > TooltipProvider > sizing div > Story`.

## 5. Route shells (Tier C) — story the leaf, don't render the shell

Route shells are thin glue (fetch + `useSearch` → render a presentational child).
The established convention covers them by **storying their extracted leaf**, which
already takes plain props (`-ResourcesList` gets `resources`/`providers`/`topics`;
`-DashboardGrid` exports `GridTile`). So:

1. **Route already delegates to a props-driven `routes/<x>.-components/-X.tsx`
   leaf** → story that leaf (Tier A/B). Done.
2. **Route holds inline render logic worth covering** → first *extract* it into a
   `routes/<x>.-components/-X.tsx` presentational component (props in,
   behavior-preserving — mirrors the existing route structure), wire the route to
   render it, regenerate the route tree
   (`pnpm --filter=@emstack/client run routeTree`, expect no routing diff — the
   `.-` folder is excluded), then story the new leaf.
3. **Rendering the `Route` shell itself** is **out of band** for this skill. It
   would need new infra — MSW (not currently a dep) or `@/utils` fetch stubs, a
   router that registers the *real* route so `useSearch`/`useLoaderData`/
   `useParams` resolve, and exporting the inner component. Don't bolt per-route
   fetch mocks on ad hoc. If a sub-issue truly requires shell-level stories,
   raise the infra decision (add MSW + a richer router stub) rather than
   improvising, and `log`/note that the shell is uncovered so it doesn't read as
   done.

## 6. Verify

```bash
# The CI gate — stories run in headless Chromium. Run with --no-file-parallelism:
# the storybook project is flaky under parallelism (bare TypeErrors across
# unrelated files), so serialize it for a trustworthy signal.
pnpm --filter=@emstack/client exec vitest run --project=storybook --no-file-parallelism

# Typecheck (catches @storybook/test slips, TS2742 satisfies/fn issues, TS4023):
pnpm typecheck      # whole repo; or: pnpm --filter=@emstack/client run typecheck

# Lint — run from the repo ROOT (the better-tailwindcss plugin needs the root cwd;
# scoping to the package falsely errors "No tailwind css entry point found").
pnpm lint
```

Typecheck must be clean apart from pre-existing unrelated errors (confirm with
`git stash` if unsure one predates your change).

Commit with a `test(<scope>):` Conventional Commit (stories are tests here), e.g.
`test(client): add storybook stories for layout components`. One area per commit
reads best. Check off the area's sub-issue under the story-coverage tracker and
add an entry to `references/area-notes.md` for anything learned (new fixture file,
a tricky decorator).

## Gotchas (learned the hard way)

- **`@storybook/test` is gone** — always `storybook/test`. CI is the only place
  the stale-package import reliably fails.
- **RouterStub mounts async** → `findBy*`, never `getBy*`, for anything inside it.
- **Radix portals escape `canvasElement`** → query `document.body`/`screen` for
  dropdown/dialog/popover content (see `DailyStatusModal.stories.tsx`).
- **`satisfies Meta` + `fn()` = TS2742.** Switch to `const meta: Meta<typeof X>`.
- **TanStack Form fields** (`components/formFields/*`) must **not** be imported
  directly (per `packages/client/CLAUDE.md`) — they read `useFieldContext()`.
  Storying them needs a small form harness that provides field context; create a
  reusable `test-utils` helper on first use rather than per-story boilerplate.
- **Don't add global decorators** in `preview.ts`.
- **Skip generated files:** `routeTree.gen.ts`, anything under `dist/`.
