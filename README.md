# The Stack

This template exists because I don't really like fullstack frameworks.

## Overall Tech
- TypeScript
- React (Frontend)
- Fastify (Middleware/Backend)

## Tooling
- ESLint - [config package](https://github.com/emilyeserven/eslint-config)
- PNPM
- Vite
- Docker
- Storybook

## FE Tech
- TanStack Query + Router
- ShadCN + Radix Primitives

# Local stuff
## DB
- Command for docker: `docker run --name course-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`
  - Verify with `docker ps`
- While running: Don't forget to `npx drizzle-kit push`!