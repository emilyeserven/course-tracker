# Middleware Checklist (Fastify / Drizzle / PostgreSQL)

## Route Structure

- **Default export**: Route files export a default async function receiving `FastifyInstance`
- **Type provider**: Routes use `.withTypeProvider<JsonSchemaToTsProvider>()` for type-safe request validation
- **JSON Schema `as const`**: Schema objects declared `as const` for type inference
- **HTTP status codes**: Use appropriate codes via `reply.code()` — 201 for creation, 204 for delete, 400/404/500 for errors
- **CORS methods**: If adding PUT or PATCH routes, verify CORS `methods` array in `app.ts` includes them

## Drizzle ORM

- **Parameterized queries**: All queries via Drizzle query builder or `sql` template tag — no string interpolation
- **Handle `undefined` from queries**: `findFirst` and similar can return `undefined` — check before using the result
- **Cascade deletes on junction tables**: When deleting a parent record (course, topic), manually delete junction table entries (`topics_to_courses`) first or verify cascade behavior
- **Data transformation**: Use utility functions in `src/utils/` for transforming data shapes — not inline in route handlers

## API Design

- **Consistent patterns**: Follow existing route patterns in `src/routes/api/` — same structure, same error handling approach
- **Validation errors**: Return descriptive error messages for validation failures, not just status codes
- **Route organization**: Routes grouped by resource in `src/routes/api/` (courses, providers, topics)
