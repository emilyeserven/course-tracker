# CLAUDE.md — @emstack/middleware

Fastify 5 + Drizzle ORM API backend. Read the root CLAUDE.md for commands and setup; this file covers middleware conventions.

## Route structure

- Fastify plugin pattern with nested route modules under `src/routes/api/`; all resources are registered with prefixes in `src/routes/api/routes.ts`.
- **Resources:** `resources`, `providers`, `routines`, `tasks`, `task-types`, `tags`, `tag-groups`, `modules`, `module-groups`, `interactions`, `daily-criteria-templates`, `routine-templates`, `dashboard-layouts`, `settings`.
- **Integration routes** (`root.ts` + `routes.ts` only — proxy/sync endpoints backed by `src/services/*`, not full CRUD resources): `google-calendar`, `readwise`, `todoist`. Plus the loose `submitOnboardData.ts` handler (onboarding mirror endpoint registered directly, not a resource folder).
- **Dailies are not an entity** — a "Daily" is purely a projection shape: `GET /api/routines?projected=true` maps routines (any mode) into the `Daily` type for the tracker/dashboard. The legacy `dailies` table and `/api/dailies` routes are gone; mutations go through `/api/routines`.
- Each resource folder follows the convention: `routes.ts` (registers handlers), `root.ts` (collection-level GET/POST), per-operation handler files (`get<X>.ts`, `create<X>.ts`, `upsert<X>.ts`, `delete<X>.ts`, `duplicate<X>.ts`), and a `<x>Rows.ts` with shared row/junction builders where create and upsert share logic (see `tasks/taskRows.ts`).
- JSON Schema type provider (`@fastify/type-provider-json-schema-to-ts`) for type-safe handlers; Swagger/OpenAPI docs auto-generated at `/documentation`.

## Shared utilities (`src/utils/`) — reuse these, don't hand-roll

- **Handler factories:** `createCreateHandler` (POST `/`: uuid + insert + junction inserts), `createUpsertHandler` (PUT `/:id`: insert + `onConflictDoUpdate` + junction sync), `createDeleteHandler` (single or multi-junction cascade).
- Junction semantics: a builder returning `undefined` means "leave existing rows untouched" (request omitted the array), `[]` means "clear". The `<x>Rows.ts` files import `schemas.ts` relatively (not via `@/`) so `node --test` can load them.
- **Schemas** (`schemas.ts`): `idParamSchema`, `nullableString/Boolean/Integer`, `statusEnum`, `resourceLevelEnum`, `dailyStatusEnum`, `resourceSchema`, `todoSchema`, `completionSchema`, `criteriaSchema`.
- **Error helpers** (`errors.ts`): `sendNotFound(reply, resource)`, `sendBadRequest(reply, message)`, `sendConflict(reply, message)`.
- **Projections:** `taskProjection.ts`, `resourceProjection.ts`, `routineProjection.ts` (which builds on `dailyProjection.ts`'s `mapDaily` for the Daily shape). Use these in GET handlers instead of bespoke `.map(...)`.
- **Junction sync:** `syncJunctionTable.ts`; routine connections: `resolveRoutineConnections.ts`, `routineConnectionRows.ts`.

## Database schema (`src/db/schema/`)

Split by domain; all `relations()` declarations live in `relations.ts`, everything re-exported from `index.ts`:

- `courses.ts` — `courseProviders`, `resources`, `module_groups`, `modules`, `interactions` (filename predates the courses → resources rename)
- `tasks.ts` — `task_types`, `tasks`, `task_resources`, `task_todos`, `tasks_to_courses` junction
- `routines.ts` — `routines`, `routine_connections` (polymorphic many-to-many linking a routine to Tasks/Resources via `connected_type` + `connected_id`), `routine_templates`
- `dailyCriteriaTemplates.ts` — `daily_criteria_templates` (standalone status-label templates; not tied to a Daily entity)
- `dashboardLayouts.ts` — `dashboard_layouts` (saved dashboard card arrangements)
- `settings.ts` — `app_settings` (app-wide settings; singleton row)
- `radar.ts` — `domains` (quadrants/rings live in the `domains.radar_config` JSONB column), `domain_within_scope_topics`, `radar_blips` (`is_ignored` marks an out-of-scope topic; `description` holds the reasoning)
- `tags.ts` — `tag_groups`, `tags`, plus per-entity tag junctions
- `enums.ts` — `recurPeriodUnit`, `status`, `dailyCompletionStatus`, `resourceLevel`, `routine_mode`, `interaction_progress/difficulty/understanding`. JSONB column shapes (`DailyCompletion`, `DailyCriteria`, `RoutineWeekly`, …) are **type-only re-exports from `@emstack/types`** — never re-declare them locally; the old local copies drifted.
- `users.ts` — `users`

## Schema changes & migrations

This project uses `drizzle-kit push` (no drizzle migration files) **plus idempotent runtime migrations**:

1. Edit `src/db/schema/`, then run `pnpm push:dev` (runs runtime migrations via `migrate:dev`, then `drizzle-kit push`).
2. If existing data must be transformed (renames, backfills, moves), add `src/db/migrate<Thing>.ts`. Convention (exemplar: `migrateDropDailies.ts`):
   - **Idempotent raw SQL** via `db.execute(sql\`...\`)` — `IF NOT EXISTS` / `IF EXISTS` guards, `information_schema` checks.
   - **Early-return on a fresh DB** (target tables don't exist yet — `drizzle-kit push` will create the final shape).
   - Register it in `runMigrations()` in `src/db/startup.ts`, wrapped in try/catch with a descriptive `console.error`, **ordered after any migrations it depends on** (add an ordering comment like the existing ones).
3. Migrations run on every server start (`app.ts` calls `runMigrations()` then `seedIfEmpty()`) and via `pnpm push:dev`/`push:prod`, so they must be safe to re-run.
4. **Pruning:** there is exactly one prod DB (self-hosted, fully controlled) and migrations run on every start, so once a migration has shipped and run in prod, delete it from `runMigrations()` and remove its file instead of letting the list grow. Fresh DBs are unaffected — `drizzle-kit push` creates the final shape and migrations early-return.

Auto-seeding: `seedIfEmpty()` seeds via `src/db/seed.ts` when the `resources` table is empty. Dev-only endpoints (`GET /api/clearData`, `GET /api/seed`) are only registered when `NODE_ENV !== "production"`.

## Testing

- Node test runner: `pnpm --filter=@emstack/middleware test`; single file: `pnpm --filter=@emstack/middleware exec node --test src/tests/<file>.test.js`.
