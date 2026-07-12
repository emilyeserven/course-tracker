# CLAUDE.md

## Project Overview

Course Tracker ("emstack") — a full-stack TypeScript monorepo, now a lean actionable dashboard for tracking tasks and routines (including a daily habit tracker — "dailies" are a projection of routines, not a separate entity). Learning-material record-keeping (links, categorization, progress, sections) is delegated to a companion app, **Simple Bookmarks** (`BOOKMARKS_API_URL`); tasks, todos, and routines associate with external bookmarks rather than storing local resources. Built with pnpm workspaces.

## Tech Stack

- **Runtime:** Node.js 22, pnpm 10
- **Frontend:** React 19, Vite 7, TanStack Router/Query/Form, Tailwind CSS 4, shadcn/ui
- **Backend:** Fastify 5, Drizzle ORM, PostgreSQL
- **Shared:** TypeScript 5.9, shared types package (`@emstack/types`)
- **Testing:** Vitest (client), Node test runner (middleware), Testing Library, Playwright
- **UI Dev:** Storybook 10

## Monorepo Structure

```
packages/
  client/       # React frontend (Vite + TypeScript) — see packages/client/CLAUDE.md
  gateway/      # Fastify reverse proxy (production entrypoint)
  middleware/   # Fastify API backend — see packages/middleware/CLAUDE.md
  types/        # Shared TypeScript type definitions
```

Build order: types → middleware → client (gateway is plain JS, no build step).

**Per-package conventions live in `packages/client/CLAUDE.md` and `packages/middleware/CLAUDE.md`** — read them before changing code in those packages.

## Common Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start db + all packages concurrently (client + middleware + types watch)
pnpm build            # Build all packages
pnpm start            # Start the gateway (production mode, requires pnpm build first)
pnpm test             # Run all tests
pnpm verify:changed   # Fast inner loop: scoped lint/typecheck/tests for changed files only
pnpm typecheck        # Type-check all buildable packages (no emit)
pnpm lint             # Lint all files (ESLint flat config, cached)
pnpm lint:fix         # Auto-fix lint issues
pnpm fallow <cmd>     # Codebase analysis (dead-code, audit --base main, dupes, health)
pnpm storybook        # Run Storybook on port 6006
pnpm studio           # Drizzle ORM database GUI
pnpm push:dev         # Run runtime migrations + push DB schema to dev
pnpm push:prod        # Run runtime migrations + push DB schema to prod

# Package-scoped: pnpm --filter=@emstack/<client|middleware|types> <script>
# Single client test:     pnpm --filter=@emstack/client exec vitest run path/to/file.test.tsx
# Single middleware test: pnpm --filter=@emstack/middleware exec node --test src/tests/<file>.test.js
# Regenerate route tree:  pnpm --filter=@emstack/client run routeTree
```

### Verification — fast inner loop

The full suite is slow: client tests run as **two Vitest projects** — a fast
`unit-tests` project (jsdom) and a `storybook` project that mounts **every story
in a real headless Chromium**. Don't run the whole thing after every edit.

- **While iterating:** `pnpm verify:changed` (or the `/verify-changed` skill) —
  it lints/typechecks only the changed packages and runs Vitest `related` (the
  affected jsdom unit tests + only the Storybook stories that import a changed
  module). Use `BASE=origin/master pnpm verify:changed` for a branch-wide sweep.
- **Before committing (the full gate, mirrors CI):**
  `pnpm typecheck && pnpm lint && pnpm --filter=@emstack/client exec vitest run`.
  `verify:changed` is scoped, so it can miss stories affected by a change to a
  shared primitive/theme it can't trace — the full gate is the source of truth.

## Local Development Setup

1. Run `pnpm install`
2. Start PostgreSQL: `docker compose up --wait db` (the `db` service has a healthcheck, so `--wait` blocks until ready)
3. Copy `packages/middleware/.env.example` to `packages/middleware/.env` and adjust if needed
4. Push DB schema: `pnpm push:dev`
5. Run `pnpm dev`

Ports: client dev server on 5173 (Vite proxies `/api` to middleware), middleware on 3001. **Both must be running** for the app to work in dev — `pnpm dev` starts everything together.

### Database reset / re-seed

The middleware **auto-seeds** an empty database on startup (`packages/middleware/src/db/seed.ts`). To clear and reseed:

```bash
# Option A: nuke the docker volume and recreate
docker compose down -v && docker compose up --wait db && pnpm push:dev

# Option B: hit the dev-only endpoints (server must be running)
curl http://localhost:3001/api/clearData
curl http://localhost:3001/api/seed
```

These endpoints are only registered when `NODE_ENV !== "production"`.

Schema changes: edit `packages/middleware/src/db/schema/` and run `pnpm push:dev` (this project uses `drizzle-kit push` plus idempotent runtime migrations in `src/db/migrate*.ts` — see the middleware CLAUDE.md).

## Generated Files — Do Not Edit

- `packages/client/src/routeTree.gen.ts` — regenerate with `pnpm --filter=@emstack/client run routeTree` (also auto-regenerates while the `vite` dev server runs). Don't read it either; it's derivable from `src/routes/`.
- `pnpm-lock.yaml` — only `pnpm install` should change it. Grep it rather than reading it whole.

## Code Quality

- **ESLint:** Flat config (`eslint.config.js`) extending the external `@emilyeserven/eslint-config` package; caching enabled via `--cache` in the lint scripts. **Always run `eslint --fix` (and `pnpm lint`) from the repo root, never from inside a package.** `import/order` resolves the `@/` alias via tsconfig paths, so its grouping is **CWD-dependent**: run from `packages/client` it sorts alias imports first and "passes", but CI runs `eslint .` from the root (which wants relative `./` imports before `@/` alias imports). Fixing from a package therefore produces an order CI rejects. Use `pnpm lint:fix` or `pnpm exec eslint --fix <paths>` from the root.
- **Git hooks:** Husky `pre-commit` runs lint-staged (`eslint --fix` on staged files); `commit-msg` runs commitlint (see Conventional Commits below). If lint-staged crashes mid-git-operation (notably when staged changes net out to an **empty commit** during rapid `git commit --amend` retries) it can orphan a `git` `index.lock`; the `pre-commit` hook removes that orphan on lint-staged failure so it doesn't block the *next* commit (set `EMSTACK_KEEP_INDEX_LOCK=1` to opt out). Note a pre-flight guard can't help once a lock already exists — git acquires the index lock *before* it runs any hook, so a pre-existing lock aborts the commit before the hook runs. If you hit `fatal: Unable to create '.git/.../index.lock': File exists` (e.g. a worktree lock left by an older checkout), recover manually:
  ```bash
  rm -f "$(git rev-parse --git-path index.lock)"   # path is worktree-specific
  git stash list   # look for "lint-staged automatic backup" — auto-fixes may be parked here
  git stash pop    # then re-stage / re-commit
  ```
- **Conventional Commits (PR titles + commit messages):** The `pr-title` CI check (`.github/workflows/pr-title.yml`, via `amannn/action-semantic-pull-request`) fails any PR whose **title** isn't a valid Conventional Commit, and the `commit-msg` hook lints each **commit message** with `@commitlint/config-conventional`. release-please also consumes these to cut releases, so they must be accurate. Format: `type(optional-scope): subject` — scope is optional, subject is required and lowercase-leaning. Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. **When opening a PR, set its title in this form** (e.g. `feat(client): add daily streak badge`, `fix: prevent duplicate routine seeds`, `chore: bump deps`) — the title is checked independently of commit messages, so a conventional title is what keeps the naming check green.
- **Linking an issue for autoclose:** put the issue's closing keyword right after the `type(scope):` prefix in the PR title (e.g. `docs: closes #427 refresh inventories`) — still a valid Conventional Commit. The `pr-autoclose` workflow (`.github/workflows/pr-autoclose.yml`) reads the first `#N` from the title and appends `Closes #N` to the PR body, so merging autocloses the issue. GitHub does **not** autoclose from the title alone — the keyword has to reach the body/commit message — which is what the workflow handles. Keep exactly one issue ref in the title.
- **Codebase analysis:** fallow for dead code, duplication, complexity, and unused dependencies — config in `.fallowrc.json`. Installed as a root devDependency, so invoke via `pnpm exec fallow <cmd>` (bare `fallow` is not on PATH; `pnpm fallow <cmd>` also works but pnpm's script banner pollutes stdout, so always use `pnpm exec` when parsing `--format json` output). The `.claude/skills/fallow/` skill is vendored from the npm package — don't hand-edit it; after a fallow version bump, re-sync with `pnpm fallow:sync-skill`
- **Dependency checks:** syncpack for version consistency
- **TypeScript:** Strict mode, ES2022 target, incremental typecheck

## Skills

Project skills live in `.claude/skills/<name>/SKILL.md`. The `/`-command name comes from the **directory name**, not the `name` field. See the [official skill docs](https://code.claude.com/docs/en/skills) for the full frontmatter reference.

**Frontmatter schema** — the repo baseline every skill follows:

- **`name`** *(required here)* — matches the directory name.
- **`description`** *(required here)* — a folded block scalar (`>-`) stating **what the skill does AND when to use it** (include the trigger phrases users say). Claude reads this to decide when to auto-invoke, so keep it specific. Combined with `when_to_use` it's truncated at ~1,536 characters in skill listings.

**Optional fields** — add only when a skill actually needs them (all are valid Claude Code fields; see the docs above): `disable-model-invocation`, `allowed-tools` / `disallowed-tools`, `context: fork` (with optional `agent`), `model`, `effort`, `argument-hint` / `arguments`, `paths`, `when_to_use`, `user-invocable`.

- **`review-pr` is the deliberate exception.** It's the only skill carrying `disable-model-invocation: true`, `allowed-tools`, and `context: fork`. These are intentional, not drift: `review-pr` is a **manual** `/review-pr` (never auto-invoked) that runs in a **forked subagent** with a scoped toolset. Leave them in place.
- **`fallow/` is vendored** (see the fallow note under Code Quality). Its frontmatter carries upstream `license` and `metadata` keys that are **not** part of Claude's schema — don't hand-edit; re-sync with `pnpm fallow:sync-skill`.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Environment Variables

| Variable | Package | Purpose | Default |
|---|---|---|---|
| `DATABASE_URL` | middleware | PostgreSQL connection string | — |
| `BOOKMARKS_API_URL` | middleware | Base URL of the companion Simple Bookmarks app (proxied for bookmark search/resolve/create) | `http://eserve-raspi:3000` |
| `POSTGRES_USER` | docker-compose | Database user | `postgres` |
| `POSTGRES_PASSWORD` | docker-compose | Database password | `password` |
| `POSTGRES_DB` | docker-compose | Database name | `coursetracker` |
| `POSTGRES_HOST_PORT` | docker-compose | Host port mapped to the db container's `5432` | `5432` |
| `GATEWAY_HOST_PORT` | docker-compose | Host port mapped to the gateway container's `3000` | `3000` |

See `packages/middleware/.env.example` for env templates.

## Deployment

- **Gateway pattern:** `packages/gateway` is the single production entrypoint — a Fastify server (`@fastify/http-proxy` + `@fastify/static`) that spawns middleware as a child process, proxies `/api/*` to it, and serves the client's static build. Same-origin requests (no CORS) and a single container to deploy.
- **Gateway startup & supervision:** on boot the gateway runs the middleware's runtime migrations and then `drizzle-kit push` (same order as `push:prod`) before spawning the middleware. Crashed middleware is respawned with exponential backoff; after too many consecutive short-lived runs the gateway exits non-zero so the container orchestrator restarts it. `GET /healthz` probes the middleware rather than always reporting ok.
- **Containers:** Docker Compose for local multi-service; root `Dockerfile` builds everything and runs the gateway.
- **Coolify:** Deploy the root Dockerfile. Only `DATABASE_URL` is needed as an env var.
