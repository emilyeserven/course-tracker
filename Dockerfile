FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g corepack
RUN corepack enable

WORKDIR /app

ENV NODE_ENV="production"


# Build stage
FROM base AS build

# Copy workspace config files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./

# Copy all package.json files for dependency resolution
COPY packages/types/package.json ./packages/types/
COPY packages/middleware/package.json ./packages/middleware/
COPY packages/client/package.json ./packages/client/
COPY packages/gateway/package.json ./packages/gateway/

# Install all dependencies (including dev for building)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store NODE_ENV=development pnpm install --frozen-lockfile

# Copy source code for all packages
COPY packages/types/ ./packages/types/
COPY packages/middleware/ ./packages/middleware/
COPY packages/client/ ./packages/client/
COPY packages/gateway/ ./packages/gateway/

# Build in dependency order
RUN pnpm --filter @emstack/types build
RUN pnpm --filter @emstack/middleware build
RUN pnpm --filter @emstack/client build


# Production stage — fresh install with only production deps
FROM base AS prod-deps

COPY --from=build /app/pnpm-workspace.yaml /app/package.json /app/pnpm-lock.yaml ./
COPY --from=build /app/packages/types/package.json ./packages/types/
COPY --from=build /app/packages/middleware/package.json ./packages/middleware/
COPY --from=build /app/packages/client/package.json ./packages/client/
COPY --from=build /app/packages/gateway/package.json ./packages/gateway/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod --ignore-scripts


# Final stage
FROM base

WORKDIR /app

# Copy production node_modules
COPY --from=prod-deps /app /app

# Copy built artifacts
COPY --from=build /app/packages/types/dist/ ./packages/types/dist/
COPY --from=build /app/packages/types/src/ ./packages/types/src/
COPY --from=build /app/packages/middleware/dist/ ./packages/middleware/dist/
COPY --from=build /app/packages/middleware/src/ ./packages/middleware/src/
COPY --from=build /app/packages/client/dist/ ./packages/client/dist/
COPY --from=build /app/packages/gateway/server.js ./packages/gateway/server.js

WORKDIR /app/packages/gateway

EXPOSE 3000
CMD ["node", "server.js"]
