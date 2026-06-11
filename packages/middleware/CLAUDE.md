# CLAUDE.md — @emstack/middleware

Fastify 5 + Drizzle ORM API backend. Read the root CLAUDE.md for commands and setup; this file covers middleware conventions.

## Route structure

- Fastify plugin pattern with nested route modules under `src/routes/api/`; all resources are registered with prefixes in `src/routes/api/routes.ts`.
- **Resources:** `resources`, `topics`, `providers`, `domains` (incl. `domains/$id/radar` sub-resource: quadrants/rings/blips), `dailies`, `routines`, `tasks`, `task-types`, `tags`, `tag-groups`, `modules`, `module-groups`, `interactions`, `daily-criteria-templates`, `routine-templates`.
- Each resource folder follows the convention: `routes.ts` (registers handlers), `root.ts` (collection-level GET/POST), per-operation handler files (`get<X>.ts`, `create<X>.ts`, `upsert<X>.ts`, `delete<X>.ts`, `duplicate<X>.ts`), and a `<x>Rows.ts` with shared row/junction builders where create and upsert share logic (see `topics/topicRows.ts`).
- JSON Schema type provider (`@fastify/type-provider-json-schema-to-ts`) for type-safe handlers; Swagger/OpenAPI docs auto-generated at `/documentation`.

## Shared utilities (`src/utils/`) — reuse these, don't hand-roll

- **Handler factories:** `createUpsertHandler` (PUT `/:id`: insert + `onConflictDoUpdate` + junction sync), `createDeleteHandler` (single or multi-junction cascade).
- **Schemas** (`schemas.ts`): `idParamSchema`, `nullableString/Boolean/Integer`, `statusEnum`, `resourceLevelEnum`, `dailyStatusEnum`, `resourceSchema`, `todoSchema`, `completionSchema`, `criteriaSchema`.
- **Error helpers** (`errors.ts`): `sendNotFound(reply, resource)`, `sendBadRequest(reply, message)`, `sendConflict(reply, message)`.
- **Projections:** `taskProjection.ts`, `resourceProjection.ts`, `dailyProjection.ts`, `routineProjection.ts`, and `processResourceLinks.ts` (flattens a `topicsToResources` join into `{id, name}[]`). Use these in GET handlers instead of bespoke `.map(...)`.
- **Junction sync:** `syncJunctionTable.ts`; routine connections: `resolveRoutineConnections.ts`, `routineConnectionRows.ts`.

## Database schema (`src/db/schema/`)

Split by domain; all `relations()` declarations live in `relations.ts`, everything re-exported from `index.ts`:

- `courses.ts` — `courseProviders`, `resources`, `module_groups`, `modules`, `interactions` (filename predates the courses → resources rename)
- `topics.ts` — `topics`, `topics_to_courses` junction (table name is legacy; links topics ↔ resources)
- `tasks.ts` — `task_types`, `tasks`, `task_resources`, `task_todos`, `tasks_to_courses` junction
- `routines.ts` — `routines`, `routine_connections` (polymorphic many-to-many linking a routine to Topics/Tasks/Resources via `connected_type` + `connected_id`), `routine_templates`
- `dailies.ts` — `dailies`, `daily_criteria_templates`
- `radar.ts` — `domains` (quadrants/rings live in the `domains.radar_config` JSONB column), `domain_within_scope_topics`, `radar_blips` (`is_ignored` marks an out-of-scope topic; `description` holds the reasoning)
- `tags.ts` — `tag_groups`, `tags`, plus per-entity tag junctions
- `enums.ts` — `recurPeriodUnit`, `status`, `dailyCompletionStatus`, `resourceLevel`, `routine_mode`, `interaction_progress/difficulty/understanding`
- `users.ts` — `users`

## Schema changes & migrations

This project uses `drizzle-kit push` (no drizzle migration files) **plus idempotent runtime migrations**:

1. Edit `src/db/schema/`, then run `pnpm push:dev` (runs runtime migrations via `migrate:dev`, then `drizzle-kit push`).
2. If existing data must be transformed (renames, backfills, moves), add `src/db/migrate<Thing>.ts`. Convention (exemplar: `migrateIgnoreBlips.ts`):
   - **Idempotent raw SQL** via `db.execute(sql\`...\`)` — `IF NOT EXISTS` / `IF EXISTS` guards, `information_schema` checks.
   - **Early-return on a fresh DB** (target tables don't exist yet — `drizzle-kit push` will create the final shape).
   - Register it in `runMigrations()` in `src/db/startup.ts`, wrapped in try/catch with a descriptive `console.error`, **ordered after any migrations it depends on** (add an ordering comment like the existing ones).
3. Migrations run on every server start (`app.ts` calls `runMigrations()` then `seedIfEmpty()`) and via `pnpm push:dev`/`push:prod`, so they must be safe to re-run.

Auto-seeding: `seedIfEmpty()` seeds via `src/db/seed.ts` when the `resources` table is empty. Dev-only endpoints: `GET /api/clearData`, `GET /api/seed`.

## Testing

- Node test runner: `pnpm --filter=@emstack/middleware test`; single file: `pnpm --filter=@emstack/middleware exec node --test src/tests/<file>.test.js`.
