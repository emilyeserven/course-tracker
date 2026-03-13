# Drizzle Schema Changes Checklist

This project uses `drizzle-kit push` (not generated migration files). Schema changes in `schema.ts` are pushed directly to the database. This makes destructive changes especially risky.

## Safety Rules

- **Avoid unnecessary schema changes**: Renaming a column, changing a type, or reordering fields all trigger destructive operations (drop + recreate). Only change the schema when the data model actually needs to change
- **Additive over destructive**: Prefer adding new nullable columns over renaming or changing existing ones. Dropping a column or changing its type destroys data
- **Enum changes**: Adding a value to a `pgEnum` is safe. Removing or renaming enum values is destructive and requires data migration
- **Default values**: Adding a `default()` to an existing column is safe. Removing a default from a column that has data is risky
- **NOT NULL constraints**: Adding `.notNull()` to an existing column will fail if any rows have NULL. Verify data before adding NOT NULL constraints

## Relationships & Keys

- **Relations are app-level only**: Drizzle `relations()` don't affect the database schema — changes to relations are safe
- **Foreign keys**: Adding `.references()` creates a real DB constraint. Ensure referenced data exists before adding FK constraints to tables with existing data
- **Junction tables**: Composite primary keys (like `topicsToCourses`) require both referenced tables to exist. Consider cascade behavior — the project currently handles deletes manually
- **Index changes**: Adding an index is safe but may be slow on large tables. Dropping an index is instant but may hurt query performance

## Review Steps

- Use Context7 to verify Drizzle schema API usage against current `drizzle-orm` docs when reviewing schema changes
- Check if `drizzle.config.ts` changes are compatible with existing database state
- Verify seed data in `src/db/seed.ts` is updated if schema changes affect seeded tables
