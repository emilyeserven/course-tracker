# TypeScript Checklist (All Packages)

- **No `any`**: Use `unknown` + type narrowing, or define a proper type in `@emstack/types`
- **`import type`**: Use `import type` for type-only imports across all packages
- **Shared types**: Add shaped type variants (Server, Display, Minimal) to `packages/types/`, not inline in client or middleware
- **`as const` on JSON Schema**: Middleware route JSON Schema objects must use `as const` for `JsonSchemaToTsProvider` type inference
- **Exhaustive switch**: `switch` on union types (`status`, `recurPeriodUnit`) must be exhaustive — use `never` default or `satisfies`
- **No non-null assertions (`!`)**: Unless the value is provably non-null immediately after a guard
- **Generic constraints**: Prefer `<T extends Base>` over loose `<T>`
- **Strict null checks**: Handle `undefined`/`null` cases — don't assume values exist (e.g., Drizzle `findFirst` can return `undefined`)
- **Runtime validation**: API responses, form inputs, and URL search params validated at the boundary with Zod schemas
- **Cross-package type changes**: Changes to `packages/types/` must update all consumers in client and middleware
