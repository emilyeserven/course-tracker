# CLAUDE.md

## Project Overview

Course Tracker ("emstack") — a full-stack TypeScript monorepo for tracking online courses and learning goals. Built with pnpm workspaces.

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
  middleware/   # Fastify API backend
  types/        # Shared TypeScript type definitions
```

Build order: types → middleware → client

## Common Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all packages concurrently (client + middleware + types watch)
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all files (ESLint flat config)
pnpm lint:fix         # Auto-fix lint issues
pnpm storybook        # Run Storybook on port 6006
pnpm studio           # Drizzle ORM database GUI
```

### Package-specific commands

```bash
# Client
pnpm --filter=@emstack/client test       # Run client tests
pnpm --filter=@emstack/client build      # Build client

# Middleware
pnpm --filter=@emstack/middleware test    # Run middleware tests
pnpm --filter=@emstack/middleware dev     # Run middleware dev server
pnpm --filter=@emstack/middleware push:dev   # Push DB schema (dev)
```

## Local Development Setup

1. Copy `.npmrc.example` to `.npmrc` and configure GitHub token for `@emilyeserven` scoped packages
2. Run `pnpm install`
3. Start PostgreSQL: `docker run --name course-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`
4. Configure middleware `.env` with database URL
5. Push DB schema: `cd packages/middleware && pnpm push:dev`
6. Run `pnpm dev`

Ports: client on 3000, middleware on 3001

## Architecture Notes

### Frontend
- File-based routing with TanStack Router (routes in `packages/client/src/routes/`)
- Auto-generated route tree (`routeTree.gen.ts` — do not edit manually)
- Components organized by purpose: `layout/`, `ui/`, `boxes/`, `boxElements/`, `forms/`, `utils/`
- shadcn/ui components live in `components/ui/` — add new ones via shadcn CLI
- Path alias: `@` → `packages/client/src`
- Theme support via ThemeProvider context (dark/light mode)

### Backend
- Fastify plugin pattern with nested route modules under `src/routes/api/`
- Resources: courses, topics, providers (each has `routes.ts`, `root.ts`, handler files)
- Drizzle ORM schema in `src/db/schema.ts` — tables: users, topics, courseProviders, courses
- JSON Schema type provider for type-safe route handlers
- Swagger/OpenAPI docs auto-generated

### Shared Types
- `@emstack/types` package exports Course, Topic, CourseProvider, etc.
- Used by both client and middleware via workspace protocol

## Code Quality

- **ESLint:** Flat config (`eslint.config.js`) with typescript-eslint and Tailwind CSS plugin
- **Git hooks:** Husky pre-commit and pre-push run lint-staged (`eslint --fix` on all staged files)
- **Dependency checks:** knip for unused dependencies, syncpack for version consistency

## Deployment

- **Client:** Vercel (SPA with rewrite rules in `vercel.json`)
- **Containers:** Docker Compose for local multi-service; Dockerfiles use multi-stage builds with distroless base
