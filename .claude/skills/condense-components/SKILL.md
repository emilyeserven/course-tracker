---
name: condense-components
description: >-
  Audit a folder or area of the app for redundant React components and condense
  them — reuse an existing primitive instead of a hand-rolled element, extract a
  shared component for a control that's duplicated across files, and collapse
  sibling render blocks that differ only in data into one component. Use when
  asked to "condense/consolidate/dedupe components", "combine/merge these
  components", or "can these components be shared/unified". Pairs with
  `condense-types` (types) — use that for type/interface dedupe.
---

# Condense components (course-tracker)

Reduce duplicate and overlapping React component markup in a target area (a
folder, a feature, or a single file) **without changing behavior**. Quality
only — for behavior cleanups use `/simplify`, for bugs use `/code-review`. This
is the component-level sibling of `condense-types`; if you're also seeing
duplicate type/interface declarations, run that too.

Shared primitives live in `packages/client/src/components/ui/` (shadcn-derived)
and the root-level `components/*.tsx` vendored files. Feature components live in
`components/<feature>/` (`radar/`, `dailies/`, `tasks/`, …). Most condensing is
pulling hand-rolled markup back toward a primitive, or lifting a copy-pasted
block into one shared component.

## 1. Inventory the target area

List the components in scope and look for repeated JSX structure across files —
the same element with the same class soup, the same control wired up more than
once, sibling blocks that differ only in their data:

```bash
grep -rn "^export function\|^export const\|^function " <target-dir>/*.tsx
```

For a wide sweep ("across the app"), delegate to an **Explore agent** — ask it
for `file:line`, what the duplicated block renders, and which existing primitive
(if any) already covers it. Also lean on **fallow**, which flags duplication in
this repo:

```bash
pnpm exec fallow dupes        # duplicate code/markup
pnpm exec fallow dead-code    # components/exports now unused — delete outright
```

Read the actual markup of each candidate before deciding, and check whether a
primitive already exists (`grep -rn "export function" components/ui`). Don't
classify from the name alone.

## 2. Classify each candidate into a pattern

### Pattern A — hand-rolled element that a primitive already covers → reuse it
A `<span>`/`<button>`/`<div>` with the same class string as an existing
primitive. Replace it with the primitive. `cn()` uses **tailwind-merge**
(`lib/utils.ts`), so a primitive can absorb a variant via `className` —
later, conflicting utilities win:
- Example: the `rounded-sm … text-[10px]` status-badge `<span>`s in
  `BlipLlmReviewTable` / `RadarConfigTab` became `<Pill className="rounded-sm
  px-1.5 text-[10px] …">` — twMerge resolves `rounded-full→rounded-sm`,
  `text-xs→text-[10px]`, `px-2→px-1.5`.
- If the primitive needs to forward an attribute it didn't before (e.g. `title`),
  widen its props to `React.ComponentProps<"el">` and spread `...props` — don't
  fork it.

### Pattern B — same stateful control wired up in 2+ places → extract a shared component
A control with imperative or fiddly wiring repeated across files. Extract it to
`components/ui/`; expose the per-call-site variation as an explicit prop rather
than re-deriving it inside.
- Example: the "select all" `<input type="checkbox">` whose `indeterminate` flag
  is set via a `ref` callback appeared 3× (`BlipLlmReviewTable`, `BlipTable`,
  `boxes/TopicsTable`). It became `SelectAllCheckbox` with `indeterminate` as a
  **boolean prop** — the sites compute it differently (`!all && some` vs a plain
  `some`), so deriving it inside would have been wrong.

### Pattern C — sibling render blocks differ only in data/labels → one component with slots
2+ blocks with identical structure (heading + list, card + rows) that vary only
in their content. Collapse them into one component that takes pre-built
content/render slots so it stays dumb.
- Example: `RadarLegend` inlined a heading-+`<ul>`-of-`BlipLegendItem` block that
  duplicated `SimpleBlipLegendSection`. They merged into one `BlipLegendSection`
  taking `items: { blip; label }[]` (callers pre-build each row's `label`), an
  optional `emptyMessage`, and an optional `headingStyle` — now one definition
  renders the quadrant lists, the adopted group, and the ignored group.

## 3. Guardrails (when NOT to condense)

- **Similar markup ≠ same component.** Two bars/cards that look alike but have
  different *interaction models* must stay separate. `BlipBulkBar` (controlled,
  single shared Apply, `NO_CHANGE` sentinel) and `BulkEditBar` (internal pending
  state, per-control Apply, placeholder) were deliberately **not** merged — one
  configurable component would need a flag for every divergence and read worse
  than two. If unifying needs an ever-growing pile of `variant`/boolean props,
  stop and leave them apart.
- **Don't over-parameterize.** A "shared" component with one caller, or three
  render-slot props that each fire once, earns nothing — inline it.
- **Keep the home right.** Cross-cutting primitives go in `components/ui/`;
  feature-only pieces stay in `components/<feature>/`. Don't drag a radar-specific
  component into `ui/` just because it was extracted.
- **Match existing layout/styling.** A reuse that shifts padding, rounding, or
  font size is a behavior change — verify the merged classes render the same.
- **Skip generated files**: `routeTree.gen.ts`, anything under `dist/`.

## 4. Apply

- Update the markup, then every importer (grep the whole package, not just the
  folder — consumers live in routes/other features). After removing an export,
  re-grep the package for its name; the typecheck surfaces stragglers.
- The lint-staged formatter reorders/normalizes imports on save — don't
  hand-fuss import ordering.

## 5. Stories + tests for the resulting components

Every extracted/widened shared component gets a co-located Storybook story and a
test. **Both stay next to the component** — this repo co-locates `*.stories.tsx`
and `*.test.ts(x)` (no `__tests__/` folder). If a caller asks for a `__tests__/`
folder, follow that, but co-location is the default. Vitest's `unit-tests`
include (`**/*.test.{ts,tsx}`) finds tests either way.

If the ask is broader than the components you touched — e.g. "every component in
this folder needs a story" — first reuse the mock-data factories: extract shared
`make*` builders into `test-utils/radarFixtures.ts` (blips/quadrants/rings/topics
+ a `byId` map helper) instead of re-rolling args in each story. One
`*.stories.tsx` per component file covering the primary export (plus meaningful
siblings — e.g. both illustrations); heavy containers get a single representative
render story. A render-only story (no `play`) still smoke-tests rendering.

- **Story** — mirror `components/Text.stories.tsx`: `Meta`/`StoryObj` from
  `@storybook/react-vite`, `within`/`expect`/`fn`/`userEvent` from
  `@storybook/test`, an optional `play` assertion. Stories run as browser
  interaction tests via the `storybook` vitest project, so each one also
  smoke-tests rendering.
- **Test** — Vitest + Testing Library (`render`/`screen`/`fireEvent` from
  `@testing-library/react`; no `user-event` dep). jsdom env + jest-dom matchers
  are set up in `setupTests.js`. The first component test in a package may need
  `src/vitest.d.ts` (`import "@testing-library/jest-dom/vitest"`) so the matchers
  (`toBeInTheDocument`, …) are typed.

### Story authoring gotchas (learned the hard way)
- **Annotate `meta` explicitly** — `const meta: Meta<typeof X> = {…}`, NOT
  `satisfies Meta<…>` — whenever args use `fn()`. The inferred meta type embeds
  the `@vitest/spy` Mock type and isn't portable (TS2742). Likewise, if `meta`
  references a component prop whose interface isn't exported, export it (TS4023).
- **Async handler args**: `fn(async () => {})` trips
  `@typescript-eslint/no-empty-function`. Use `fn(() => Promise.resolve())`.
- **Host-element wrappers**: a component that returns a non-standalone fragment
  needs its parent supplied by a story decorator — wrap SVG `<g>`/`<circle>`
  components in `<svg>` (and in `<TooltipProvider>` if they use a Radix
  `Tooltip`), and `TableRow` components in `<Table><TableBody>`.
- **Router-dependent components**: anything rendering a TanStack `<Link>` (often
  transitively — a legend, a table, a chart that renders a legend) needs router
  context. Use `@/test-utils/RouterStub` (memory-router, context-only) as a story
  decorator and a test wrapper. It mounts children after the router's initial
  load, so assert with **async `findBy*`** queries, not `getBy*`. Don't add a
  global decorator in `preview.ts` — the async mount breaks existing sync `play`s.
- **jsdom gotcha**: `fireEvent.click` fires `onChange` even on a `disabled`
  input, so don't assert "disabled ⇒ handler not called" in jsdom — assert the
  `disabled` attribute instead.
- **Story file naming need not match the component file** (e.g. `radarLegendItem.tsx`
  → `BlipLegendItem.stories.tsx`). Don't audit coverage by filename match alone;
  grep each component's export for a referencing `.stories.tsx`.

## 6. Verify

```bash
pnpm --filter=@emstack/client exec tsc --noEmit -p tsconfig.app.json   # client typecheck
pnpm --filter=@emstack/client exec vitest run --project=unit-tests <changed dirs/files>
pnpm --filter=@emstack/client exec vitest run --project=storybook --no-file-parallelism
pnpm exec eslint <changed files>                                       # run from repo ROOT —
                                                                       # the tailwind plugin
                                                                       # needs the root cwd
```

The `storybook` project runs stories in a headless browser and is **flaky under
parallelism** — it intermittently throws bare `TypeError`s across arbitrary story
files (even ones you didn't touch), while each passes in isolation. Run it with
`--no-file-parallelism` for a deterministic signal before trusting a failure.

Use `pnpm --filter=@emstack/client run typecheck` (or `pnpm typecheck` for the
whole repo) rather than a bare `tsc` at the root — the root has stale incremental
build artifacts that produce spurious `TS6305` errors. The typecheck must be
clean apart from pre-existing, unrelated errors (confirm with `git stash` if
unsure one predates your change).

Commit with a `refactor(<scope>):` Conventional Commit, one logical change per
commit (each consolidation, plus the stories/tests, read better split).
