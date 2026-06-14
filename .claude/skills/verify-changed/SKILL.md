---
name: verify-changed
description: >-
  Run the fast, scoped verification inner loop instead of the repo-wide
  checks: lints/typechecks only the changed packages and runs Vitest
  `related` (the affected jsdom unit tests plus only the Storybook stories
  that import a changed module). Use after a batch of edits, or when asked to
  "verify changed files", "run the fast checks", "quick verify", "check just
  what I changed", or via /verify-changed — reserve the full `pnpm typecheck
  && pnpm lint && vitest run` gate for right before committing.
user-invocable: true
---

# Verify changed (course-tracker)

The full verification suite is slow — the `storybook` Vitest project mounts
**every** story in a real headless Chromium. During iteration you almost never
need the whole suite; you need the checks that the files you just touched
actually affect.

## Run it

```bash
pnpm verify:changed                      # vs the working tree (default)
BASE=origin/master pnpm verify:changed   # branch-wide: changed since merge-base
```

This wraps `scripts/verify-changed.mjs`, which:

1. Collects changed files (working tree + staged + untracked; add `BASE=` for a
   branch-wide diff).
2. Buckets them by package (`packages/{client,middleware,types}/`).
3. Runs **only** what those changes affect:
   - **ESLint** (cached, check-only) on the changed JS/TS files.
   - **Incremental typecheck** for the changed buildable package(s) (a `types/`
     change falls back to the full `pnpm typecheck`).
   - **Vitest `related`** — one run covering the affected jsdom unit tests **and
     only the Storybook stories that import a changed module** (real browser).
   - **Middleware `node --test`** suite when middleware changed (it's tiny).

## When NOT to use it

`verify:changed` is the inner loop, not the commit gate. `vitest related` only
runs stories that import a changed module — a change to a shared primitive,
theme, or global may affect stories it can't trace. **Before committing, run the
full gate:**

```bash
pnpm typecheck && pnpm lint && pnpm --filter=@emstack/client exec vitest run
```

> If `vitest related` ever misses a touched story (e.g. a story you edited
> directly doesn't get picked up), run that file directly instead:
> `pnpm --filter=@emstack/client exec vitest run --project storybook path/to/Foo.stories.tsx`.
