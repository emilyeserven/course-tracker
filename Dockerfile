FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

ENV NODE_ENV="production"


# Dependency stage — download keyed on the lockfile alone, install keyed on manifests
FROM base AS deps

# package.json comes along for its packageManager pin; the download itself is keyed on the lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store NODE_ENV=development pnpm fetch

COPY packages/types/package.json ./packages/types/
COPY packages/middleware/package.json ./packages/middleware/
COPY packages/client/package.json ./packages/client/
COPY packages/gateway/package.json ./packages/gateway/

# Install all dependencies (including dev for building)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store NODE_ENV=development pnpm install --frozen-lockfile --offline

COPY tsconfig.json ./


# Per-package build stages — middleware and client build in parallel,
# and a source change in one package doesn't rebuild the others
FROM deps AS build-types

COPY packages/types/ ./packages/types/
RUN pnpm --filter @emstack/types build


FROM build-types AS build-middleware

COPY packages/middleware/ ./packages/middleware/
# Transpile-only: skip type checking here (--noCheck) since CI (.github/workflows/ci.yml)
# owns the type gate. Mirrors the `build` script minus the type check to speed up images.
RUN pnpm --filter @emstack/middleware exec tsc -b tsconfig.build.json --noCheck \
 && pnpm --filter @emstack/middleware exec tsc-alias -p tsconfig.build.json --resolve-full-paths


FROM build-types AS build-client

COPY packages/client/ ./packages/client/
# The client bundles the repo-root CHANGELOG.md at build time (the @root Vite
# alias + ?raw import in -DashboardChangelog.tsx), so it must be present here.
COPY CHANGELOG.md ./
RUN pnpm --filter @emstack/client build


# One-shot stage for pushing the Drizzle schema (compose `db-push` service).
# DATABASE_URL comes from the environment; no .env file needed.
FROM build-middleware AS db-push

WORKDIR /app/packages/middleware
CMD ["pnpm", "push:prod"]


# Production stage — fresh install with only production deps (client ships as static files)
FROM base AS prod-deps

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/middleware/package.json ./packages/middleware/
COPY packages/client/package.json ./packages/client/
COPY packages/gateway/package.json ./packages/gateway/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod --ignore-scripts --filter '!@emstack/client'


# Final stage
FROM base

WORKDIR /app

# Copy production node_modules
COPY --from=prod-deps /app /app

# Copy built artifacts
COPY --from=build-types /app/packages/types/dist/ ./packages/types/dist/
COPY --from=build-types /app/packages/types/src/ ./packages/types/src/
COPY --from=build-middleware /app/packages/middleware/dist/ ./packages/middleware/dist/
COPY --from=build-middleware /app/packages/middleware/src/ ./packages/middleware/src/
COPY --from=build-middleware /app/packages/middleware/drizzle.config.ts ./packages/middleware/drizzle.config.ts
COPY --from=build-client /app/packages/client/dist/ ./packages/client/dist/
COPY packages/gateway/server.js ./packages/gateway/server.js

WORKDIR /app/packages/gateway

EXPOSE 3000
CMD ["node", "server.js"]
