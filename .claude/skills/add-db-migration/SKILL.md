---
name: add-db-migration
description: >-
  Add an idempotent runtime database migration to the middleware (rename a
  column, backfill data, move data between tables, drop a legacy table). Use
  whenever a schema change needs existing rows transformed — drizzle-kit push
  only diffs the shape, it never moves data.
---

# Add a runtime DB migration (course-tracker)

This project uses `drizzle-kit push` (no drizzle migration files) plus **idempotent runtime migrations** in `packages/middleware/src/db/migrate*.ts`. They run on every server start (`app.ts` → `runMigrations()`) and at the front of `pnpm push:dev` / `push:prod`, so they must be safe to re-run forever.

**Exemplar to copy:** `packages/middleware/src/db/migrateIgnoreBlips.ts`.

## Steps

1. **Update the schema** in `packages/middleware/src/db/schema/` to the *final* shape (new columns/tables ship in the schema; the migration only transforms existing data). Relations go in `relations.ts`.

2. **Write `packages/middleware/src/db/migrate<Thing>.ts`** exporting one async function. Rules, all non-negotiable:
   - Raw SQL via `db.execute(sql\`...\`)`. Use `IF NOT EXISTS` / `IF EXISTS` on every DDL statement.
   - **Early-return on a fresh DB**: check the target table exists before touching it. CRITICAL: always qualify `information_schema` checks with `AND table_schema = 'public'` — information_schema has built-in views named `domains` and `routines`, so an unqualified `WHERE table_name = 'domains'` matches on an *empty* database and the guard silently lies.
   - Guard each transform on a "has this already run?" condition (legacy column still exists, legacy table still has rows, etc.), not on a version number.
   - Wrap multi-statement data moves in `db.transaction(...)`.
   - Top-of-file comment explaining what it migrates and why.

3. **Register it in `runMigrations()`** in `packages/middleware/src/db/startup.ts`:
   - `try/catch` with a descriptive `console.error("Failed to …", err)` and re-`throw`, matching the existing blocks.
   - **Order matters**: place it after every migration it depends on, with an ordering comment like the existing ones (e.g. "Runs after dailies → routines so every routine row exists first").

4. **Verify**:
   ```bash
   pnpm typecheck && pnpm lint
   pnpm push:dev          # runs migrations, then drizzle-kit push
   pnpm push:dev          # MUST succeed again unchanged — idempotency check
   ```
   If data was transformed, spot-check with `pnpm studio` or psql. Also verify against a fresh DB when feasible (`docker compose down -v && docker compose up --wait db && pnpm push:dev`) — fresh-DB early returns are where migrations usually break.

## Don'ts

- Don't edit old migrations to add new behavior — add a new file.
- Don't query Drizzle table objects for tables/columns the final schema no longer declares; use raw SQL.
- Don't assume the migration runs once: prod and every dev clone replay the whole list on each start.
