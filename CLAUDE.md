# CLAUDE.md

## Project Overview

Course Tracker ("emstack") — a full-stack TypeScript monorepo for tracking online courses, learning topics, daily habits, and tasks. Built with pnpm workspaces.

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
  client/       # React frontend (Vite + TypeScript)
  gateway/      # Express reverse proxy (production entrypoint)
  middleware/   # Fastify API backend
  types/        # Shared TypeScript type definitions
```

Build order: types → middleware → client (gateway is plain JS, no build step)

## Common Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all packages concurrently (client + middleware + types watch)
pnpm build            # Build all packages
pnpm start            # Start the gateway (production mode, requires pnpm build first)
pnpm test             # Run all tests
pnpm typecheck        # Type-check all buildable packages (no emit)
pnpm lint             # Lint all files (ESLint flat config)
pnpm lint:fix         # Auto-fix lint issues
pnpm storybook        # Run Storybook on port 6006
pnpm studio           # Drizzle ORM database GUI
```

### Package-specific commands

```bash
# Client
pnpm --filter=@emstack/client test            # Run client tests (Vitest)
pnpm --filter=@emstack/client typecheck       # Type-check only
pnpm --filter=@emstack/client build           # Build client
pnpm --filter=@emstack/client run routeTree   # Regenerate TanStack Router route tree

# Middleware
pnpm --filter=@emstack/middleware test        # Run middleware tests (node --test)
pnpm --filter=@emstack/middleware typecheck   # Type-check only
pnpm --filter=@emstack/middleware dev         # Run middleware dev server
pnpm --filter=@emstack/middleware push:dev    # Push DB schema (dev)
pnpm --filter=@emstack/middleware push:prod   # Push DB schema (prod)
```

### Running a single test

```bash
# Client (Vitest)
pnpm --filter=@emstack/client exec vitest run path/to/file.test.tsx

# Middleware (Node test runner)
pnpm --filter=@emstack/middleware exec node --test src/tests/<file>.test.js
```

## Local Development Setup

1. Run `pnpm install`
2. Start PostgreSQL (pick one):
   - **Docker Compose (recommended):** `docker compose up --wait db` (uses compose defaults; the `db` service has a healthcheck so `--wait` blocks until it's ready)
   - **Standalone:** `docker run --name course-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`
3. Copy `packages/middleware/.env.example` to `packages/middleware/.env` and adjust if needed
4. Push DB schema: `pnpm --filter=@emstack/middleware push:dev`
5. Run `pnpm dev`

Ports: client dev server on 5173 (Vite proxies `/api` to middleware), middleware on 3001. **Both must be running** for the app to work in dev — `pnpm dev` starts everything together.

### Database reset / re-seed

The middleware **auto-seeds** an empty database on startup via `packages/middleware/src/db/seed.ts`. To clear and reseed:

```bash
# Option A: nuke the docker volume and recreate
docker compose down -v && docker compose up --wait db
pnpm --filter=@emstack/middleware push:dev

# Option B: hit the dev-only endpoints (server must be running)
curl http://localhost:3001/api/clearData
curl http://localhost:3001/api/seed
```

If you change `packages/middleware/src/db/schema.ts`, run `pnpm --filter=@emstack/middleware push:dev` to push the new schema (this project uses `drizzle-kit push`, not migration files).

## Architecture Notes

### Frontend
- File-based routing with TanStack Router (routes in `packages/client/src/routes/`)
- Auto-generated route tree (`routeTree.gen.ts` — do not edit manually)
- Components organized by purpose: `ui/` (shadcn-style primitives), `layout/`, `boxes/`, `boxElements/`, `dailies/`, `radar/`, `tasks/`, `forms/` (field composition primitives + `CourseFields`), `formFields/` (TanStack Form-aware field components), plus shared primitives at the root (`button`, `calendar`, `combobox`, `input`, `input-group`, `popover`, `radio-group`, `textarea`, `sonner`, etc.)
- shadcn/ui components live in `components/ui/` — add new ones via shadcn CLI
- Path alias: `@` → `packages/client/src`
- Theme support via ThemeProvider context (dark/light mode)
- **Forms:** Uses TanStack Form's `createFormHook` API. The `useAppForm` hook (re-exported from `components/formFields/index.ts`, defined in `hooks/useAppForm.ts`) registers context-based field components (`InputField`, `TextareaField`, `NumberField`, `RadioGroupField`, `DatePickerField`, `ComboboxField`, `MultiComboboxField`) accessed via `form.AppField` — do not import the field components directly. They live in `components/formFields/` and access form state via `useFieldContext()` from `utils/fieldContext.ts`. To add a new reusable field: create the component, register it in `useAppForm.ts`.
- **Edit-page boilerplate** (skip-blocker, query invalidation, navigation, delete handler) lives in `hooks/useEditFormPage.ts`. New edit routes should reuse it.
- **Loading / error placeholders** for routes use `<EntityPending entity="..."/>` and `<EntityError entity="..."/>` from `components/EntityStates.tsx`.
- **Fetch layer:** `utils/fetchFunctions.ts` builds typed entity clients with `createEntityClient(endpoint, label)` (CRUD + duplicate). Each entity gets a `<name>Api` object and named function re-exports (`upsertCourse`, `fetchSingleCourse`, etc.). Reuse the helper rather than hand-rolling `fetch` calls.

### Backend
- Fastify plugin pattern with nested route modules under `src/routes/api/`
- **Resources:** `courses`, `topics`, `providers`, `domains`, `dailies`, `tasks`, `task-types`, `daily-criteria-templates`, plus `domains/$id/radar` sub-resource (quadrants, rings, blips)
- Each resource folder follows the convention: `routes.ts` (registers handlers), `root.ts` (collection-level GET/POST), per-operation handler files (`getX.ts`, `upsertX.ts`, `deleteX.ts`, `duplicateX.ts`, etc.)
- Drizzle ORM schema in `src/db/schema.ts`
- JSON Schema type provider (`@fastify/type-provider-json-schema-to-ts`) for type-safe route handlers
- Swagger/OpenAPI docs auto-generated at `/documentation`
- Auto-seeds on empty database via `src/db/seed.ts`
- **Shared handler factories** in `src/utils/`: `createDeleteHandler` (single or multi-junction cascade), `createUpsertHandler` (insert + onConflictDoUpdate + junction sync). Reuse these instead of hand-writing CRUD.
- **Shared schemas** in `src/utils/schemas.ts`: `idParamSchema`, `nullableString/Boolean/Integer`, `statusEnum`, `resourceLevelEnum`, `dailyStatusEnum`, `resourceSchema`, `todoSchema`, `completionSchema`, `criteriaSchema`.
- **Error helpers** in `src/utils/errors.ts`: `sendNotFound(reply, resource)`, `sendBadRequest(reply, message)`.

### Database Schema
Defined in `packages/middleware/src/db/schema.ts`.

- **Core tables:** `users`, `topics`, `courseProviders`, `courses`, `dailies`, `tasks`, `resources` (task resources), `task_todos`, `domains`
- **Junction tables:** `topics_to_courses`, `topics_to_domains`, `domain_excluded_topics`
- **Radar tables:** `radar_quadrants`, `radar_rings`, `radar_blips`
- **Enums:** `recurPeriodUnit` (days/months/years), `status` (active/inactive/complete/paused), `dailyCompletionStatus` (incomplete/touched/goal/exceeded/freeze), `resourceLevel` (low/medium/high)
- Uses `drizzle-kit push` (not migration files) — schema changes pushed directly to database

### Shared Types
- `@emstack/types` package exports Course, Topic, CourseProvider, Domain, Daily, Task, Radar, etc.
- Used by both client and middleware via workspace protocol
- Add new types as `packages/types/src/MyType.ts` and re-export from `packages/types/src/index.ts`. Run `pnpm --filter=@emstack/types build` (or `pnpm dev` which runs `tsc --watch`) so the dist output picks them up before consumers import them.

## Common Workflows

### Adding a new API endpoint to an existing resource

1. Create a handler file in `packages/middleware/src/routes/api/<resource>/<verb><Thing>.ts`. Define a `schema` with `idParamSchema` for params (if applicable) and shared schemas from `src/utils/schemas.ts` for the body.
2. For DELETE handlers, prefer `createDeleteHandler` from `src/utils/createDeleteHandler.ts`. For PUT/upsert handlers, prefer `createUpsertHandler` from `src/utils/createUpsertHandler.ts`.
3. Register the new handler in the resource's `routes.ts` with `fastify.register(...)`.
4. Add a corresponding fetch function — usually you want to add a method on the entity client in `packages/client/src/utils/fetchFunctions.ts`. The named exports (`upsertCourse`, etc.) are thin re-exports of `coursesApi.upsert`, etc.

### Adding a new resource

1. Add the table(s) and relations to `packages/middleware/src/db/schema.ts` and run `pnpm --filter=@emstack/middleware push:dev`.
2. Add a shared type at `packages/types/src/<Name>.ts` and re-export from `index.ts`.
3. Create `packages/middleware/src/routes/api/<name>/` with `routes.ts`, `root.ts`, and per-operation handler files. Reuse `createDeleteHandler` / `createUpsertHandler`.
4. Register the resource in `packages/middleware/src/routes/api/routes.ts`.
5. Add an `<name>Api = createEntityClient<...>(...)` in `packages/client/src/utils/fetchFunctions.ts`.
6. Add routes in `packages/client/src/routes/<name>.*.tsx`. Run `pnpm --filter=@emstack/client run routeTree` to regenerate `routeTree.gen.ts` (or it'll happen automatically when `vite` runs).

### Adding a new page (client)

1. Create the route file in `packages/client/src/routes/`. File naming follows TanStack Router conventions: `foo.tsx` is the layout, `foo.index.tsx` is the index page, `foo.$id.tsx` is the dynamic-segment layout, `foo.$id.edit.tsx` is a child route.
2. Run `pnpm --filter=@emstack/client run routeTree` to regenerate `routeTree.gen.ts` (the dev server also regenerates it on file save when running).
3. For edit pages, use the `useEditFormPage` hook from `@/hooks/useEditFormPage` to avoid re-implementing skip-blocker / invalidation / navigation boilerplate.
4. For loading/error placeholders use `<EntityPending entity="..."/>` and `<EntityError entity="..."/>` from `@/components/EntityStates`.

## Code Quality

- **ESLint:** Flat config (`eslint.config.js`) with typescript-eslint and Tailwind CSS plugin
- **Git hooks:** Husky pre-commit and pre-push run lint-staged (`eslint --fix` on all staged files)
- **Dependency checks:** knip for unused dependencies, syncpack for version consistency
- **TypeScript:** Strict mode, ES2022 target

## Environment Variables

| Variable | Package | Purpose | Default |
|---|---|---|---|
| `DATABASE_URL` | middleware | PostgreSQL connection string | — |
| `POSTGRES_USER` | docker-compose | Database user | `postgres` |
| `POSTGRES_PASSWORD` | docker-compose | Database password | `password` |
| `POSTGRES_DB` | docker-compose | Database name | `coursetracker` |

See `packages/middleware/.env.example` for env templates.

## Deployment

- **Gateway pattern:** The gateway (`packages/gateway`) is the single production entrypoint — an Express server that spawns middleware as a child process, proxies `/api/*` to it, and serves the client's static build files. This means same-origin requests (no CORS needed) and a single container to deploy.
- **Containers:** Docker Compose for local multi-service; root `Dockerfile` builds everything and runs the gateway
- **Coolify:** Deploy the root Dockerfile. Only `DATABASE_URL` is needed as an env var.
- **Environment:** Middleware uses `.env` (local) / `.env.production` with `DATABASE_URL` as the key variable
