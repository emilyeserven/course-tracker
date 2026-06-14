# CLAUDE.md

## Project Overview

Course Tracker ("emstack") — a full-stack TypeScript monorepo for tracking learning resources (courses/books/etc.), topics, routines (including a daily habit tracker — "dailies" are a projection of routines, not a separate entity), and tasks. Built with pnpm workspaces.

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

- **ESLint:** Flat config (`eslint.config.js`) extending the external `@emilyeserven/eslint-config` package; caching enabled via `--cache` in the lint scripts
- **Git hooks:** Husky `pre-commit` runs lint-staged (`eslint --fix` on staged files); `commit-msg` runs commitlint (see Conventional Commits below)
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

## Environment Variables

| Variable | Package | Purpose | Default |
|---|---|---|---|
| `DATABASE_URL` | middleware | PostgreSQL connection string | — |
| `POSTGRES_USER` | docker-compose | Database user | `postgres` |
| `POSTGRES_PASSWORD` | docker-compose | Database password | `password` |
| `POSTGRES_DB` | docker-compose | Database name | `coursetracker` |

See `packages/middleware/.env.example` for env templates.

## Deployment

- **Gateway pattern:** `packages/gateway` is the single production entrypoint — a Fastify server (`@fastify/http-proxy` + `@fastify/static`) that spawns middleware as a child process, proxies `/api/*` to it, and serves the client's static build. Same-origin requests (no CORS) and a single container to deploy.
- **Gateway startup & supervision:** on boot the gateway runs the middleware's runtime migrations and then `drizzle-kit push` (same order as `push:prod`) before spawning the middleware. Crashed middleware is respawned with exponential backoff; after too many consecutive short-lived runs the gateway exits non-zero so the container orchestrator restarts it. `GET /healthz` probes the middleware rather than always reporting ok.
- **Containers:** Docker Compose for local multi-service; root `Dockerfile` builds everything and runs the gateway.
- **Coolify:** Deploy the root Dockerfile. Only `DATABASE_URL` is needed as an env var.
