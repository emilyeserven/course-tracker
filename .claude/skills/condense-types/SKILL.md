---
name: condense-types
description: >-
  Audit a folder or area of the app for redundant TypeScript types and
  condense them — collapse re-declarations of shared @emstack/types shapes,
  resolve duplicate type-name collisions, and extract shared base interfaces
  via `extends`. Use when asked to "condense/consolidate/dedupe types",
  "combine these interfaces", or "can these types be shared/extended".
---

# Condense types (course-tracker)

Reduce duplicate and overlapping type/interface declarations in a target area
(a folder, a feature, or a single file) **without changing behavior**. Quality
only — for behavior cleanups use `/simplify`, for bugs use `/code-review`.

The single source of truth for cross-package shapes is **`packages/types/src/`**
(`@emstack/types`). The client and middleware both consume it; local
re-declarations drift. Most condensing is pulling things back toward that.

## 1. Inventory the target area

List every type/interface in scope and where each is used:

```bash
cd <target-dir>
grep -rn "^export type\|^export interface\|^type \|^interface " *.ts *.tsx
```

For a wide sweep (many files / "across the app"), delegate to an **Explore
agent** — ask it for `file:line`, the type name, its shape, and which shared
type it overlaps. Also lean on **fallow**, which already flags duplication and
unused types in this repo:

```bash
pnpm exec fallow dupes        # duplicate code/shapes
pnpm exec fallow dead-code    # unused exported types worth deleting outright
```

Read the actual shape of each candidate before deciding — and read the shared
type it might match (`packages/types/src/<Name>.ts`). Don't classify from the
name alone.

## 2. Classify each candidate into a pattern

### Pattern A — re-declares a shared `@emstack/types` shape → import it
A local interface structurally equal to (or a subset of) a shared type. Delete
it and import the shared one; update consumers.
- Example: `QuadrantInfo`/`RingInfo`/`PersistedQuadrant`/`PersistedRing` were all
  `RadarQuadrant`/`RadarRing` (alias of `RadarConfigEntry`).
- **Middleware schema JSONB shapes are a hard rule**, not a judgment call: per
  `packages/middleware/CLAUDE.md`, re-export them type-only from
  `@emstack/types` (`export type { X } from "@emstack/types"`), never
  re-declare — local copies have drifted before. See `db/schema/enums.ts` for
  the canonical pattern.

### Pattern B — duplicate exported name, different shape → rename to disambiguate
Two `export`ed types sharing a name but not a shape are a footgun (easy to
import the wrong one). They **can't** be combined — rename each to its context.
- Example: two `EditDraft`s became `LlmEditDraft` (blipLlmReview) and
  `BlipEditDraft` (BlipEditRow).

### Pattern C — sibling interfaces share a prop cluster → extract a base, `extends`
When 2+ interfaces repeat the same group of fields verbatim, extract a base
interface they each `extend`. Adding/changing a field then touches one place.
- Example: `BlipLegendItemProps` and `SimpleBlipLegendSectionProps` shared four
  handler props → extracted `BlipLegendHandlers`.
- If one interface is a strict superset of another, have it `extend` the
  smaller directly instead of inventing a base.
- Reach for `Pick<T, …>` / `Omit<T, …>` when an interface is a slice of a shared
  type rather than a fresh cluster.

## 3. Guardrails (when NOT to condense)

- **Structural match ≠ semantic match.** Draft types (`QuadrantDraft`,
  `RingDraft`, `BlipDraft` — `id?` + `localKey` for unsaved rows) and API DTOs
  (`*Payload`, `BulkBlipEntry`) deliberately differ from persisted shapes.
  Leave them.
- **Don't force an `extends` when a member is sourced differently.** Verify the
  candidate actually *receives* every base field. `RadarLegend` looked like it
  could extend `BlipLegendHandlers`, but it builds `registerRef` internally
  (`useCallback`) rather than taking it as a prop — so it shares the callbacks
  but not the full set. The typecheck catches this; if forcing the fit needs
  ever-smaller tiers, stop and leave it separate.
- **Don't over-tier.** A base interface used by only one type earns nothing —
  inline it.
- **Skip generated files**: `routeTree.gen.ts`, anything under `dist/`.

## 4. Apply

- Update the declaration, then every importer (grep the whole package, not just
  the folder — consumers like hooks/routes live elsewhere). After Pattern B
  renames especially, re-grep the package for the old name; the first typecheck
  will otherwise surface stragglers.
- The lint-staged formatter reorders/normalizes imports on save — don't
  hand-fuss import ordering.

## 5. Verify

```bash
pnpm typecheck                                   # whole repo; types cross packages
pnpm --filter=@emstack/client exec vitest run <changed test files>
pnpm exec eslint <changed files>                 # run from repo ROOT — the
                                                 # tailwind plugin needs the root
                                                 # cwd to find its css entrypoint
```

`pnpm typecheck` is the real safety net for type-only refactors — it must be
clean apart from pre-existing, unrelated errors (confirm with `git stash` if
unsure one predates your change).

Commit with a `refactor(<scope>):` Conventional Commit, one logical change per
commit (consolidation vs. rename vs. extraction read better split).
