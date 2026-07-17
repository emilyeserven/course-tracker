---
name: overnight-cleanup
description: >-
  Autonomous overnight codebase health sweep for course-tracker (emstack). Runs
  fallow dead-code removal, test coverage for under-tested high-risk code (plus
  hardening existing tests to run faster and less flaky without weakening them),
  duplicate consolidation, complexity reduction (extracting complicated/nested
  conditionals into readable structures), large-file splitting, Storybook story
  coverage for undocumented components, and skill maintenance in a fixed phase
  order — committing after each successful phase and looping until the fallow
  health score reaches 8.0 or higher, then opening a PR for the sweep, plus a
  separate branch/PR off the latest master for each item too risky to bundle,
  subscribing to each, and doing at least one proactive round of CI follow-up
  before going event-driven. Use for an "overnight cleanup", "autonomous health
  sweep", "clean up the codebase overnight", or a hands-off fallow-driven refactor run.
---

# Overnight cleanup (course-tracker / emstack)

An unattended, multi-hour codebase-health sweep. It runs in a **fixed phase order**,
commits after each successful phase, pushes after each iteration, and loops until the
fallow health score reaches **8.0** (or stops making progress). At the end it opens a
PR for the mechanical sweep, splits any risky change onto its own branch/PR, and stays
event-driven on CI.

Read the **Safety rules** before every phase. They are what make a crash cost one phase,
not the whole night.

## 0. Pre-flight stock-taking

Before any phase, capture baselines with fallow. Invoke fallow via `pnpm exec fallow`
(bare `fallow` is not on PATH; `pnpm fallow` prints a script banner that corrupts JSON).

```bash
pnpm exec fallow health --hotspots --targets --file-scores --format json --quiet 2>/dev/null || true
pnpm exec fallow dead-code --format json --quiet 2>/dev/null || true
pnpm exec fallow dupes --format json --quiet 2>/dev/null || true
pnpm exec fallow --format json --quiet 2>/dev/null || true   # composite report
```

Record the baselines in working memory **and** append them to a scratch run-log
(`/tmp/overnight-run.md`) so they survive a container reclaim. Track:

- **Health score** — `.health_score` from `fallow health`. Target ≥ **8.0**.
- **Dead-code issues** — `.total_issues` from `fallow dead-code`. Target **0**.
- **Duplication %** — `.stats.duplication_percentage` from `fallow dupes`. Target **< 6.5 %** (the gate in `.fallowrc.json`).
- **Complexity findings** — `.findings[]` where `kind` contains `"complexity"`. Target **0 above caps** (cyclomatic ≤ 30, cognitive ≤ 25).
- **Untested high-risk files** — cross-reference refactoring targets + complexity findings against the test-file map (Phase 2). Heuristic, trending down; fallow gives no coverage %.

CI enforces fallow: `.github/workflows/fallow-audit.yml` runs `pnpm exec fallow --fail-on-issues`
on every PR and on push to `master`. Keeping the numbers above green is what keeps that gate green.

## Safety rules (read before every phase)

1. **Never touch `packages/client/src/routeTree.gen.ts`** — generated; fallow already excludes it (`duplicates.ignore` + `**/routeTree.gen.ts`). Don't read it either.

2. **Never remove exports from `packages/client/src/components/ui/**`** — vendored shadcn/ui primitives. Unlike some repos there is **no fallow `ui/**` override here**; they're kept quiet only by the global `ignoreExportsUsedInFile: { type, interface }` plus scoped `eslint-disable` comments inside the files. So an unused-export finding in `ui/` *can* surface — still leave it alone (don't remove, don't add ignore comments, don't treat as a target).

3. **The verify suite is unattended-safe — use it exactly (never bare `pnpm test`).** Before every commit run, from the repo **root**:

   ```bash
   pnpm lint:fix                                   # from ROOT — never inside a package (import/order is CWD-dependent)
   pnpm typecheck                                  # builds @emstack/types first, then middleware + client
   pnpm --filter=@emstack/client exec vitest run   # jsdom units + browser stories, one shot, exits
   pnpm --filter=@emstack/middleware test          # node --test, fast
   ```

   ⚠️ **Do NOT run `pnpm test` or `pnpm --filter=@emstack/client test`.** Root `test` is `pnpm run -r test`, which launches the client's `vitest` in **watch mode** — it never exits and hangs the whole overnight run. Always use `exec vitest run`. If any check fails, fix before committing; if a phase can't be made green quickly, revert its diff (`git restore` / `git stash`) and move on. Never commit broken state.

4. **Prefer small, targeted commits** — one per phase per loop iteration, in Conventional Commits form (`refactor:`, `perf:`, `test:`, `docs:`, `chore:`). PR titles and commit messages are both linted (see CLAUDE.md → Conventional Commits).

5. **Never run anything that doesn't exit.** `pnpm exec fallow watch` is interactive; `pnpm test` / client `vitest` (no `run`) is watch mode; `pnpm dev` / `pnpm storybook` are long-lived servers. None belong in an unattended run.

6. **Always `--dry-run` before `fix`** — preview every fallow auto-fix first.

7. **Always pass `--format json --quiet 2>/dev/null || true`** to every fallow command so a non-zero exit or noisy stderr never derails the run.

8. **`fallow fix --yes` is required** — the environment is non-TTY; omitting `--yes` exits with code 2.

9. **`@emstack/types` has no test runner.** To cover a shared types function, add a **middleware** `node --test` test that imports it (that's how the existing shared functions are tested today — see Phase 2.4). Never add Vitest to middleware/types, and never introduce `node:test` into the client.

## Phase 1 — Dead code

**1.1 — Inspect the current report.**

```bash
pnpm exec fallow dead-code --format json --quiet 2>/dev/null || true
```

Parse `unused_exports`, `unused_files`, `duplicate_exports`. There is **no committed dead-code baseline** in this repo — every issue in the live report is a real cleanup target (except anything under `packages/client/src/components/ui/**`, per Safety rule 2). Standing target: `total_issues: 0`.

Confirm a specific export is safe to remove by tracing its callers:

```bash
pnpm exec fallow dead-code --trace <relative-file-path>:<ExportName> --format json --quiet 2>/dev/null || true
```

No callers + not under `components/ui/` ⇒ real candidate.

**1.2 — Auto-fix: preview, then apply.**

```bash
pnpm exec fallow fix --dry-run --yes --format json --quiet 2>/dev/null || true   # preview
pnpm exec fallow fix --yes --format json --quiet 2>/dev/null || true             # apply
```

**1.3 — Manual work.** Re-run `fallow dead-code`. Delete leftover unused files with no exports outright; for a file still consumed elsewhere, remove only the dead export declaration. Skip `components/ui/**`.

**1.4 — Verify and commit.** Run the verify suite (Safety rule 3). If green:

```bash
git add -p
git commit -m "refactor: remove dead code (Phase 1)"
```

Stage only dead-code removals — never unrelated drift.

**1.5 — Confirm baseline.** Re-run `fallow dead-code`; `total_issues` must be **0** before proceeding.

## Phase 2 — Test coverage and test health

Dead code is gone; now add tests to under-tested, high-risk code **before** the refactoring
phases, so those refactors land on a regression net. Don't chase a coverage %; target the code
most likely to break silently. This phase also has a behavior-preserving sub-goal (2.7): make
existing tests faster and less flaky **without weakening** them.

**2.1 — Map source files to their tests.** Each package has its own runner — never cross them:

- **client** (`packages/client`) — **Vitest** (two projects in `vite.config.ts`): fast `unit-tests` (jsdom, `*.test.{ts,tsx}`) and `storybook` (real headless Chromium mounting every `*.stories.tsx`). Shared harness: `packages/client/src/test-utils/` (`RouterStub`, `QueryStub`, `storyDecorators`, `seededQueryClient`, per-feature `*Fixtures`). jsdom setup: `packages/client/setupTests.js`. Run units: `pnpm --filter=@emstack/client exec vitest run --project unit-tests`.
- **middleware** (`packages/middleware`) — **Node test runner** (`node --test`, native TS type-stripping on Node 22). Tests live in `packages/middleware/src/tests/**/*.test.ts` (predominantly `.test.ts`, one legacy `.test.js`). Run: `pnpm --filter=@emstack/middleware test`. Note `*Rows.ts` builders import `schemas.ts` **relatively**, not via `@/`, so `node --test` can load them.
- **types** (`packages/types`) — **no test runner** (no `test` script, no co-located tests). Cover its shared functions from a middleware test (see 2.4).
- **gateway** (`packages/gateway`) — plain JS, no build, no tests. Out of scope for this sweep.

Build the untested-source map:

```bash
git ls-files 'packages/client/src/**/*.ts' 'packages/client/src/**/*.tsx' | grep -vE '\.(test|stories)\.tsx?$'
git ls-files 'packages/client/src/**/*.test.ts' 'packages/client/src/**/*.test.tsx'
git ls-files 'packages/middleware/src/**/*.ts' | grep -vE '\.test\.ts$'
git ls-files 'packages/middleware/src/tests/**/*.test.ts'
```

A source file is "covered" when a test exercises its behavior. Treat a source file with no such test as a gap.

**2.2 — Prioritize by risk, not count.** Cross-reference the untested list against pre-flight signals:

- **`refactoring_targets[]`** (complexity + coupling + churn) — untested **and** high-churn is top priority.
- **complexity `findings[]`** — branchy logic with no test is the highest-value test; it's exactly what Phase 4 will refactor, so this test is the net for that.
- **Shared, pure derivations (cheap, high-leverage):**
  - `packages/types/src/routineEntryName.ts` — `routineEntryName` (see 2.4)
  - `packages/types/src/actionableSentence.ts` — `buildActionableSentence`
  - `packages/client/src/lib/*` (e.g. `dashboardTiles.ts`, `entityDescriptions.ts`) and `packages/client/src/utils/*`
  - `packages/middleware/src/utils/*` projections (`taskProjection.ts`, `resourceProjection.ts`, `dailyProjection.ts`, `routineProjection.ts`) and `packages/middleware/src/services/*`
- Prefer pure functions / utilities / services first (no DOM or HTTP harness); component tests second.

**2.3 — Write the tests (match the package's runner).** Use the runner belonging to the package. Mirror a neighboring test for imports and harness — client tests reuse `src/test-utils/` fixtures and decorators; middleware tests follow `packages/middleware/src/tests/`. Write **behavior** tests (representative + edge inputs: empty, boundary, fallback arm), not change-detector snapshots. Cover each condition arm plus the default path for branchy logic. The `tdd` skill covers this repo's test-first flow if useful.

**2.4 — The shared cross-package functions.** `@emstack/types` ships two small functions that client and middleware **must both call so they never drift**: `routineEntryName` (schedule rendering ↔ completion baking) and `buildActionableSentence`. Because types has no runner, cover them from a **middleware** `node --test` file — mirror `packages/middleware/src/tests/routineActionParts.test.ts`, which already exercises them. Cover each branch plus the empty/default path. If gaps remain that the run doesn't close, **record them in the final report** rather than skipping silently.

**2.5 — Verify and commit.** Run the verify suite. If green:

```bash
git add -p
git commit -m "test: add coverage for under-tested <area> (Phase 2)"
```

Stage only the new tests (+ any harness wiring).

**2.6 — Coverage measurement is optional.** Coverage instrumentation is **not** configured. Only if `@vitest/coverage-v8` is already installed may you run `pnpm --filter=@emstack/client exec vitest run --project unit-tests --coverage` to refine targeting. **Do not** add the dependency or block on a network install — the file-presence + risk heuristic is sufficient, and the environment may block installs.

**2.7 — Make existing tests faster and less flaky.** A **standing, behavior-preserving** goal. It must **never weaken the safety net**.

**Guardrail (non-negotiable).** Only make a test *more reliable or faster while asserting the exact same behavior*. Do **not** delete a test, mark `.skip`/`.only`, relax an assertion, bump a `waitFor` timeout to paper over a race, or add a retry to hide a flake. If a test can't be de-flaked without weakening it, **leave it and record it** in the final report.

**Find the slow tests (read durations, don't re-run repeatedly).**

```bash
pnpm --filter=@emstack/client exec vitest run --project unit-tests --reporter=verbose 2>/dev/null || true
```

Target the few slowest files, not the whole suite. The middleware `node --test` runner also prints per-test durations.

**Find the flaky tests (static signals first).** Don't re-run the full suite to hunt flakes. Look for structural causes:

- **Real timers / arbitrary waits** — `setTimeout` / `await new Promise(r => setTimeout(r, …))` in a test is a race. Replace with fake timers (`vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync(…)`, restored in `try/finally` with `vi.useRealTimers()`).
- **Non-deterministic inputs** — `new Date()` / `Date.now()` / `Math.random()` drifts with wall-clock. Pin with `vi.setSystemTime(…)` or a fixture's fixed value.
- **Broad `waitFor` / `findBy*`** wrapping a synchronous assertion — narrow to the single observable; **do not raise the timeout**.
- **Shared mutable state / order dependence** — ensure `beforeEach`/`afterEach` reset stores, `vi.clearAllMocks()`, `vi.unstubAllGlobals()`.
- **Bounded confirmation only** — to confirm a fix, re-run *just the suspect file* a few times: `pnpm --filter=@emstack/client exec vitest run --project unit-tests <suspect-file>` (~3×), never the whole suite.

**Speed levers (all behavior-preserving):** replace an inline fixture builder with the shared `test-utils/*Fixtures`; hoist a **truly static** fixture out of `beforeEach`; prefer fake timers over a real debounce wait; a new **pure** `.test.ts` can take a `// @vitest-environment node` pragma to skip jsdom (never force a DOM-dependent file onto node). **Do not** add `retry`/`pool`/relaxed-timeout settings to `packages/client/vite.config.ts` to make the suite "pass" — that masks flakes.

**Scope and budget.** Opportunistic and bounded — fix the few highest-value slow/flaky tests, not the whole suite. If a test hasn't improved after ~2 attempts, note it and move on. Like coverage/stories/skills it does **not** move the health score, so run it **once per run**, unless the tests you added in 2.1–2.5 this iteration introduced new slowness/flakiness. Verify, then commit on its own: `git commit -m "test: speed up and de-flake existing tests (Phase 2)"`.

## Phase 3 — Duplicates

**3.1 — Inspect.**

```bash
pnpm exec fallow dupes --format json --quiet 2>/dev/null || true
```

Budget is **6.5 %** (`duplicates.threshold` in `.fallowrc.json`). The `ignore` list already excludes `routeTree.gen.ts`, several `routes/api/**` handler shapes (`get*.ts`, `delete*.ts`, `duplicate*.ts`, `root.ts`), and all `*.test.*` / `*.stories.*`. Don't refactor those for duplication. Focus on `clone_groups[]`; work the largest `token_count` groups first.

**3.2 — Trace before refactoring.**

```bash
pnpm exec fallow dupes --trace dup:<fingerprint> --format json --quiet 2>/dev/null || true
```

Read the actual source at the returned ranges before writing any abstraction.

**3.3 — Manual refactoring strategy** (no auto-fix for dupes):

- **Shared utility function** — extract to the right layer: pure client utilities → `packages/client/src/lib/` or `packages/client/src/utils/`; shared cross-package helpers → `packages/types/src/`; middleware utilities → `packages/middleware/src/utils/` (integration logic → `packages/middleware/src/services/`).
- **Shared React component** — parametrize and lift into `packages/client/src/components/` (the app and any panel views share components — no view-only variants).
- **Extract inline one-off components into their own files** to surface *future* duplication — an inline `const Foo = () => …` is invisible to the clone detector. When you touch a file that buries a non-trivial component inline, lift it to a co-located `Foo.tsx` (named, file-level export) even with one caller today; that makes the next copy detectable (Phase 3) and earns it a story (Phase 6). Trivial 2–3 line fragments can stay inline.
- **Shared hook** — when the same TanStack Query call + options repeats, extract a shared `queryOptions` object (see `packages/client/src/utils/queryKeys.ts` conventions) and call it from each hook.
- **Do not consolidate the excluded `routes/api/**` handler boilerplate** — the repetition is intentional Fastify registration structure and is already ignored.

The `condense-components` and `condense-types` skills automate the component/type dedupe patterns above — reach for them when the group is a component or a type shape.

**3.4 — Verify and commit.** Verify suite → `git commit -m "refactor: consolidate duplicate code (Phase 3)"`.

**3.5 — Confirm budget.** Re-run `fallow dupes`; `stats.duplication_percentage` must be **< 6.5 %** (the CI gate fails at/above it). Keep reducing before Phase 4 if not.

## Phase 4 — Complexity

**4.1 — Identify hotspots.**

```bash
pnpm exec fallow health --hotspots --targets --file-scores --format json --quiet 2>/dev/null || true
pnpm exec fallow health --complexity --complexity-breakdown --format json --quiet 2>/dev/null || true
```

Caps (`.fallowrc.json`): `maxCyclomatic: 30`, `maxCognitive: 25`. Any finding above either is a hard violation. Work the highest-priority `--targets` first. The `--complexity-breakdown` `contributions[]` lists each branch/loop/boolean/case with its line and weight.

**4.2 — Refactoring patterns.**

- **Extract complicated/nested conditionals into the clearest structure** — a named predicate/helper (`isEligibleForX(task)`), a named constant for a magic threshold or compound boolean, a lookup `Record`/`Map` in place of an `if/else`/`switch` ladder, or an early-return guard to flatten nesting. Small single-use helpers that name a confusing expression earn their keep even with one caller — readability is the goal, not reuse.
- **Pair every extracted conditional with a test** in the **same commit** (Phase 2 runner rules) so the refactor is provably behavior-preserving. If branchy logic is hard to test in isolation, the extraction boundary is wrong — fix the seam, don't skip the test.
- **Extract sub-functions / split switch arms** into named module-level helpers (prefer named over anonymous — names lower cognitive score).
- **Decompose React components.** fallow scores each function **independently** — nested lambdas/handlers of the *same* component **do not lower its score**. Two levers: (a) for JSX-prop-driven scores, give each extracted child a **narrower** prop interface and delegate by spreading (`<Child {...props} />`) so the parent collapses to flat one-attribute children; (b) for **hook-density** (+1 cognitive per hook call), distribute `useState`/`useRef`/`useEffect` into cohesive sub-hooks and move a controller's state+handlers into a `use*Controller` hook, lifting heavy `??` chains into module-level (testable) helpers, leaving a thin JSX shell. This repo's form/edit machinery lives in `packages/client/src/hooks/` (`useAppForm.ts`, `useEditFormPage.ts`) and route `*.edit.tsx` files — good candidates. Run `--complexity-breakdown` to confirm what's driving the score before choosing a lever.
- **Do not add `// fallow-ignore-next-line complexity`** unless the complexity is genuinely unavoidable (e.g. an exhaustive type-narrowing switch that can't split without losing type safety). Last resort, not a shortcut.

**4.3 — Verify and commit.** Verify suite (commit may bundle the refactor + the tests that pin it) → `git commit -m "refactor: reduce complexity hotspots (Phase 4)"`.

**4.4 — Confirm zero hard violations.** Re-run `fallow health`; no `findings[]` above the caps. Continue Phase 4 if any remain.

## Phase 5 — Large files and high-import files

**5.1 — Identify.**

```bash
pnpm exec fallow health --file-scores --targets --format json --quiet 2>/dev/null || true
```

`file_scores[]` gives each file's `loc`, `imports`, `score`. Treat as targets: `loc > 400` (doing too much) and `imports > 20` (coordinating too many concerns). Prioritize files that also appear in `refactoring_targets[]`. Files over the ESLint `import/max-dependencies` warning (threshold **10**) are handled by the **`reduce-imports`** skill — use it for the import-count lever.

**5.2 — How to split.** Split on a genuine seam, never an arbitrary line count:

- **Component `*.tsx`** — move sub-components to co-located files or `packages/client/src/components/`; move utility functions to `packages/client/src/lib/<feature>.ts`. Keep the public export surface stable and update callers.
- **Hook `use*.ts`** (`packages/client/src/hooks/`) — split along entity lines or the query/mutation/local-state boundary.
- **Route `packages/client/src/routes/*.tsx`** — keep thin (fetch → pass to component); extract rendering into `packages/client/src/components/` past ~150 lines.
- **Middleware service/util** (`packages/middleware/src/services|utils/*.ts`) — split on entity boundaries past ~300 lines.
- **Do not split just to hit a line count.**

**5.3 — After splitting.** Update all import paths, run the verify suite → `git commit -m "refactor: split large files (Phase 5)"`.

## Phase 6 — Storybook story coverage

Every component should have a Storybook story. **Be aggressive: trend toward documenting everything.**
A component without a story is the default target — only skip one when it genuinely can't render in
isolation (6.4), and record the reason. This repo already has 159 stories; match their convention.

Stories are co-located `<Component>.stories.tsx`, CSF3, importing from **`@storybook/react-vite`**.
Config: `packages/client/.storybook/main.ts` / `preview.ts` / `vitest.setup.ts`. The **`add-stories`
skill** encodes this repo's exact story conventions (fixtures from `@/test-utils/*Fixtures`,
`RouterStub`/`QueryStub`/`storyDecorators` wrappers) — use it to write the stories.

**6.1 — Find components missing a story.**

```bash
git ls-files 'packages/client/src/**/*.tsx' | grep -v '\.stories\.tsx$'
git ls-files 'packages/client/src/**/*.stories.tsx'
```

`Foo.tsx` is covered when `Foo.stories.tsx` sits beside it. Every uncovered `*.tsx` that exports a React component is a target (include `components/ui/**` primitives — most already have stories). Skip pure non-component modules (only re-exports / types / constants, no rendered component).

**6.2 — Write a story per uncovered component.** Mirror an existing sibling (e.g. `packages/client/src/components/ui/button.stories.tsx`):

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Foo } from "./Foo";

const meta: Meta<typeof Foo> = {
  component: Foo,
  args: {
    /* minimal realistic props — reuse @/test-utils/*Fixtures where one exists */
  },
};
export default meta;

type Story = StoryObj<typeof meta>;
export const Default: Story = {};
```

Supply minimal realistic `args` (or a `render` fn for stateful components) so it renders meaningfully. Add **variant stories** for clearly distinct states (empty/populated/error, open/closed) — `Default` is the floor, not the goal. If it needs Router/Query/Form context, reuse the decorator pattern a similar existing story already uses (`storyDecorators.tsx`, `RouterStub`, `QueryStub`) rather than inventing a harness.

**6.3 — Verify and commit.** Stories are validated by the Vitest **storybook** project (real headless Chromium), **not** `build-storybook`. Run the verify suite (its `vitest run` covers both projects), or target just the browser project while iterating:

```bash
pnpm --filter=@emstack/client exec vitest run --project storybook
```

Then:

```bash
git add 'packages/client/src/**/*.stories.tsx'
git commit -m "docs: add Storybook stories for undocumented components (Phase 6)"
```

**6.4 — When to skip.** Only skip — and note the reason — when a component genuinely can't render in isolation: an abstract render-prop/context-only helper with no visual output, or one that hard-requires live network/runtime state no decorator can stub (note that `vitest.setup.ts` blocks `/api` calls during story runs). "It has a lot of props" is not a reason — supply representative args.

## Phase 7 — Skill maintenance

The repo's own skills document its patterns and drift as the code evolves. Keep them honest by grounding them in what actually changed.

**7.1 — Review recent commits.**

```bash
git log --oneline -n 30
git log --stat -n 30
```

Watch for: new entities/components/patterns, renamed/relocated patterns, deleted concepts, and any change that touched several files the same way (a repeatable workflow worth a skill).

**7.2 — Evaluate existing skills against the commits.**

```bash
ls .claude/skills/
```

`.claude/skills/` mixes **repo-specific real directories** (maintain these — `add-entity`, `add-field-to-entity`, `add-db-migration`, `add-stories`, `audit-guards`, `check-components`, `condense-*`, `organize-components`, `reduce-imports`, `review-pr`, `verify-changed`, and this one) with **symlinks into `.agents/skills/`** (portable cross-repo engineering skills — `tdd`, `code-review`, `research`, etc.). **Only touch the repo-specific real directories**; leave the symlinked/portable skills alone. For each real skill ask: still accurate (do its paths/names/patterns still exist)? still needed (or did a commit remove the pattern)? now redundant with another?

`.claude/skills/fallow/` is **vendored** from the `fallow` npm package — don't hand-edit. If a `fallow` bump drifts it, re-sync with `pnpm fallow:sync-skill` and commit the result. (There is no `fallow:check-skill` script in this repo.)

**7.3 — Add / update / remove.** Add a skill when commits reveal a repeatable multi-file workflow that isn't documented (mirror an existing skill's frontmatter — `name` + a trigger-rich `description`; see `.claude/skills/writing-great-skills/`). Update a skill whose paths/names drifted. Remove one whose pattern no longer exists. When unsure whether to remove, leave it and note it in the final report.

**7.4 — Verify and commit.** Skill files are Markdown (no test/typecheck impact); run the verify suite only if you changed a non-skill file. Commit on their own: `git commit -m "docs: reconcile repo skills with recent commits (Phase 7)"` (`chore:` is fine for a pure deletion).

## Loop control

After phases 1–7, check the health target. Phases 2, 6, 7 don't move the health score but still run every iteration (Phase 2 is the net the refactors depend on; 6/7 are standing goals).

```bash
pnpm exec fallow health --format json --quiet 2>/dev/null || true   # read .health_score
```

| Score | Decision |
|---|---|
| ≥ 8.0 | **Stop.** Target reached → Final verification. |
| 7.0 – 7.9 | Continue. Meaningful gains remain. |
| < 7.0 | Continue. Significant work remains. |
| Same as previous iteration | **Stop.** No further automated gains — remaining delta needs design decisions, not mechanical cleanup. |

Before each new iteration, append to the run-log:

```
Iteration N:
  Health before: X.X
  Dead-code issues: N (target 0)
  Duplication %: N.N %
  Tests added this iteration: N (areas: …)
  Phases with commits: [...]
  Health after: X.X
```

## Robustness for long unattended runs

Ephemeral container, no human watching. Build the run so a crash costs at most one phase.

- **Checkpoint by pushing, not just committing.** Push after **every iteration** (`git push -u origin claude/overnight-cleanup-skill-ql29ur`, with retry/backoff on network errors per the session's git instructions) — unpushed commits die with the container.
- **Cap the work** — ~6 loop iterations max; stop early on the "same score" rule. Never loop one phase forever: if a finding hasn't moved after ~2 attempts, skip it, note it, move on.
- **Resume safely** — at startup read `git log --oneline` and the run-log to see which phases already committed this run; don't redo or double-commit.
- **Never leave the tree dirty or red** — if a phase can't go green quickly, `git restore` / `git stash` it and continue. A clean tree at every phase boundary is what makes a crash recoverable.
- **Treat test flakes as flakes during verification** — a failing test mid-run gets re-run once before you believe it; if intermittent, note it and move on (proactive hardening is the deliberate Phase 2.7 activity, done from a green tree).
- **Be install-averse** — the network policy may block installs. If a phase wants a package that isn't present, prefer the zero-dependency path or skip-and-note rather than failing the run.
- **One PR for the sweep; risky items each get their own branch off the latest `master`** (see below). Don't bundle a risky refactor into the sweep PR.
- **Always produce the final report**, even on an early/budget stop.

## Final verification

Once the loop exits:

```bash
pnpm exec fallow --format json --quiet 2>/dev/null || true            # composite
pnpm exec fallow health --format json --quiet 2>/dev/null || true     # confirm ≥ 8.0 or report actual
pnpm exec fallow dead-code --format json --quiet 2>/dev/null || true  # confirm 0
pnpm exec fallow dupes --format json --quiet 2>/dev/null || true      # confirm < 6.5 %
pnpm lint:fix
pnpm typecheck
pnpm --filter=@emstack/client exec vitest run
pnpm --filter=@emstack/middleware test
```

Report: health score achieved; dead-code issues remaining (target 0); final duplication %; tests added (count + areas) and any high-risk code still untested (with `file:line` — e.g. note `routineEntryName` / `buildActionableSentence` if their coverage wasn't extended); existing tests sped up / de-flaked (count + areas) and any left as-is (with the reason they couldn't be hardened without weakening them); total commits; any remaining violations that couldn't be auto-fixed (`file:line`). If the score didn't reach 8.0, list the specific findings blocking it and the manual refactoring each needs — a precise next-steps hand-off is the deliverable.

## Open a PR and watch CI (end of work)

Do this only at the very end — after all phases, all commits, and the branch is pushed. Never mid-loop.

**Risky items get their own branch and PR.** The end-of-run PR covers the **mechanical sweep**. Anything too risky to bundle — a large-function/large-file split, a complex-component decomposition, finishing a half-applied feature, anything with real blast radius — is handled **one at a time, each on its own branch off the latest `master`**:

1. `git fetch origin master && git checkout -b <topic-branch> origin/master` — **not** off the sweep branch, so each risky PR is independent.
2. Make the single focused change, add a test pinning the behavior (Phase 2 rules), verify green (the verify suite). If it can't go green quickly, abandon that branch and note it.
3. Commit, push, open a PR with a Conventional-Commits title scoped to that **one** item, subscribe to it.
4. Repeat, **re-cutting off the latest `master`** each time (earlier PRs may have merged — a stale base is how the merged-result typecheck goes red).

**Push the sweep branch** (retry with backoff on network errors):

```bash
git push -u origin claude/overnight-cleanup-skill-ql29ur
```

**Open the PR** against `master` with the GitHub MCP tools (`mcp__github__create_pull_request`; if a PR already exists for the branch, **update** it via `mcp__github__update_pull_request` instead of opening a second). CI's `pr-title` check lints the title independently of commits, so get it right the first time:

- **Title starts with a Conventional Commits prefix** — pick the one matching the bulk of the work (usually `refactor:` for a cleanup sweep, e.g. `refactor: overnight codebase health sweep`). Allowed types: `feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`.
- **If it closes an issue,** put exactly one closing keyword right after the prefix (e.g. `refactor: closes #NNN overnight codebase health sweep`) — the `pr-autoclose` workflow reads the first `#N` from the title into the body.
- **Body:** mirror the final report — per-phase changes, before/after health score, dead-code and duplication numbers, tests added (and any high-risk code left untested), stories added, skill changes — so a reviewer can scan the outcome.

**Subscribe so CI can be handled automatically**, then do one proactive round before going idle:

```
mcp__github__subscribe_pr_activity   # the new PR's number
```

Immediately check each PR's CI once (`mcp__github__pull_request_read` with `method: "get_status"`) and act on anything actionable from that first look — a `pr-title` miss, an obvious lint/type failure, a flagged conflict — rather than waiting on a webhook for what you can already see (webhooks don't deliver CI *success* or merge-conflict transitions). Only then settle into **event-driven** mode: don't poll with `sleep`; PR events arrive as `<github-webhook-activity>` messages that wake the session. On a CI failure, re-run the relevant verification locally, then push a fix on the same branch; on an ambiguous review comment, ask via `AskUserQuestion` rather than guessing. Keep handling events until the PR is **merged or closed**. Because CI-success / merge-conflict transitions aren't delivered as events, if `send_later` is available schedule a check-in ~an hour out to re-verify mergeability, then re-arm or stop once merged.

Report the PR URL(s) and that the session is now watching, as the final line of the run.
