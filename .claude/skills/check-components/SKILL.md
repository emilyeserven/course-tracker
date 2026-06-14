---
name: check-components
description: >-
  Audit React component placement in the client package: find one-off
  components in shared/inline locations that belong in a route's
  *.-components/ folder, and route-private *.-components/ components that are
  used outside their route or duplicate something in shared components/.
  Reports findings and proposes grouped GitHub refactor tasks. Use when asked
  to "check components", "audit component placement", or via /check-components.
  Accepts an optional route/folder to scope the scan.
---

# Check components (course-tracker)

Audit component **placement** in `packages/client/src` and report drift from the
project convention — then propose grouped GitHub refactor tasks. This skill
**reads and reports only**; it never moves files and never creates issues on its
own (it hands you ready-to-run `gh` commands).

## The convention

Two homes for components (see `packages/client/CLAUDE.md`):

- **Shared library** — `src/components/**`, imported via the `@/components/...`
  alias and reused across routes. Includes intentionally-shared **primitives**:
  `components/ui/` (the shadcn primitives, incl. `button`, `combobox`, `popover`,
  `input`, …), `components/layout/`, `components/formFields/`, and the shared
  `components/dialogs/` family. Also feature folders (`dailies/`, `routines/`,
  `radar/`, `tasks/`, `resources/`, `boxes/`, …). No component lives directly in
  `components/` — everything is in a themed subdirectory.
- **Route-private** — sibling `*.-components/` folders (the `.-` prefix keeps
  them out of TanStack routing), imported by relative path like
  `./dashboard.-components/-DashboardGrid`.

Two things drift over time, and this skill checks both:

1. A component in a **non-`-components`** location (shared folder or inlined in a
   route) is really used by **one route only** → it should be **colocated** in
   that route's `*.-components/` folder.
2. A component in a **`*.-components/`** folder is either **used outside its
   route** (→ **promote** to shared `components/`) or is **similar to something
   already in `components/`** (→ **dedupe** / reuse the shared one).

## Scope

Parse `$ARGUMENTS`:

- **Empty** → scan the whole client (`packages/client/src`).
- **A route name or folder path** (e.g. `/check-components dashboard` or
  `/check-components packages/client/src/components/radar`) → scope the scan to
  that route family / directory.

Assume `pnpm install` has been run. All paths below are relative to the repo root.

## Step 1 — Map the territory

Enumerate the route-private folders and their **owning route prefix** (derive it
from the folder name — strip the `.-components` suffix and any dynamic segments):

```bash
# All route-private folders (there are ~4 today)
ls -d packages/client/src/routes/*.-components 2>/dev/null
```

- `dashboard.-components/` → route family **`dashboard`**
- `settings.-components/` → **`settings`**
- `routines.$id.edit.-components/` → **`routines`**
- `domains.$id.edit.-components/` → **`domains`**

Then enumerate the shared library and mark the **off-limits primitives** — these
are *never* colocation candidates no matter how few consumers they have:

```bash
ls packages/client/src/components            # root files + feature subfolders
ls packages/client/src/components/ui packages/client/src/components/layout \
   packages/client/src/components/formFields  # intentionally shared — skip for Check 1
```

For a wide / "whole app" sweep, delegate the enumeration and grepping to an
**Explore agent** and have it return a `file:line` usage map.

## Step 2 — Build the usage map

For each candidate component, find every importer across the **whole package**
(consumers live in routes, hooks, and other components). Match both import forms:

```bash
# absolute alias form, e.g. @/components/radar/BlipLegend
grep -rn "@/components/<subpath>/<Name>" packages/client/src --include=*.tsx --include=*.ts
# relative route-private form, e.g. ./dashboard.-components/-DashboardGrid
grep -rn "\.-components/-<Name>" packages/client/src --include=*.tsx --include=*.ts
```

Derive each importer's **route family** from its path under `src/routes/` (the
filename prefix before the first `.`). A component's consumers reduce to a set of
route families — that set drives all three checks.

Ignore co-located **test/story files** (`*.test.tsx`, `*.stories.tsx`) as
importers — they follow their component and aren't independent consumers.

## Step 3 — Check 1: Colocation candidates (→ route `*.-components/`)

A component under `src/components/**` (a **feature** folder, not a primitive
folder) or defined inline in a single route, whose consumer set is **exactly one
route family**, is a candidate to **move into that route's `*.-components/`
folder** (relative imports; create the folder named after the route file if the
route has none).

**Guardrails — do not flag:**

- Anything in `ui/`, `layout/`, `formFields/`, or `dialogs/`.
- A component with **more than one** route family in its consumer set.
- A single-consumer component that is **clearly a reusable primitive by design**
  (generic, presentational, no route coupling — e.g. a generic `ProgressBar`).
  Note the reasoning when you skip one for this reason.

## Step 4 — Check 2a: Escapees (`*.-components/` → promote to shared)

For each component inside a `*.-components/` folder, check its consumer set
against the folder's **owning route family**. If any importer belongs to a
**different** route family, the component has escaped its route and is a
candidate to **promote** to shared `components/` — pick the matching feature
subfolder (or root for a generic one) and update all imports to the `@/` alias.

## Step 5 — Check 2b: Duplicates (`*.-components/` ≈ shared `components/`)

Surface structural duplication with the repo's existing tooling, then confirm by
reading:

```bash
pnpm exec fallow dupes    # run from repo ROOT; flags duplicated code/shapes
```

Cross-reference fallow's hits (and obvious name/shape similarity) between
`*.-components/` files and shared `components/`. A route-private component that
duplicates or closely resembles a shared one is a candidate to **refactor to
reuse the shared component**.

- **Guardrail:** structural similarity ≠ semantic equivalence. Read **both**
  files before flagging — drafts, DTOs, and route-specific variants can look
  alike but differ on purpose.
- For the **type** half of any such merge (shared prop shapes / interfaces),
  hand off to `/condense-types` rather than reinventing it here.

## Step 6 — Report & propose tasks

Produce a findings report grouped **one section per category**, and **within each
category split by feature or path group**:

- **Colocate** (Check 1) — split by target route family (colocate-`dailies`,
  colocate-`radar`, …)
- **Promote** (Check 2a) — split by source `*.-components/` folder
- **Dedupe** (Check 2b) — split by feature / the shared component involved

Each finding states: the component, its **current path → proposed path**, and the
**consumer evidence** (which route families import it, with `file:line`).

**Do not create issues automatically.** For each (category × feature/path-group)
bucket, emit a ready-to-run command using the existing **`refactor`** label in
the **current repo** — omit `--repo` so `gh` infers it from the local git remote,
which keeps the skill portable if it's copied to another project:

Pass the body as a plain multi-line string (not a `$(cat <<EOF …)` heredoc — a
heredoc-substituted command doesn't start with `gh`, so the `Bash(gh:*)`
permission pattern won't match):

```bash
gh issue create --label refactor \
  --title "refactor(client): colocate <feature> components into *.-components" \
  --body "Components used by only the <feature> route that should move out of shared components/:

- [ ] components/<feature>/<Name>.tsx → routes/<feature>.-components/-<Name>.tsx (consumers: <route> only)
- [ ] ...

Found by /check-components."
```

Use the matching title prefix per category:
`colocate <feature> components into *.-components` /
`promote <component> out of <route>.-components to shared components` /
`dedupe <route>.-components/<Name> against components/<shared>`.

State plainly that filing is left to the user — they can copy/run any command, or
ask you to file a specific bucket.

## Guardrails recap — never flag

- Shared primitives: `components/ui/`, `components/layout/`, `components/formFields/`,
  `components/dialogs/`.
- Generated files: `routeTree.gen.ts`.
- Test/story files as standalone candidates — they follow their component.
