# Suggestions for `@emilyeserven/eslint-config`

Findings from the agent-experience pass on this repo (June 2026) that can only
be fixed upstream in the shared config package. Local mitigations are in place
where possible (`--cache` on lint scripts, scoped disables in vendored files).

## Rule changes

1. **Disable `react/prop-types` for TypeScript files.** Props are already
   type-checked; the rule only generates noise (see the scoped disable block in
   `packages/client/src/components/calendar.tsx`). Add to the TS override:
   `"react/prop-types": "off"`.

2. **Carve barrel files out of `import/max-dependencies`.** Barrel/index files
   exist to aggregate imports; the rule forces blanket disables in
   `packages/types/src/index.ts`, `packages/client/src/utils/index.ts`,
   `packages/client/src/utils/api/index.ts`. Suggested override:
   `files: ["**/index.ts"]` with the rule off (or a higher max).

3. **Investigate the `@stylistic/indent` ↔ JSX-wrapping conflict.** On nested
   JSX in attribute position (`render={<Button ... />}` — base-ui pattern),
   the indent fixer and the JSX wrapping rules fight each other; ESLint reports
   `ESLintCircularFixesWarning` and leaves unfixable errors. Reproduce with
   `packages/client/src/components/combobox.tsx` (currently carries a
   file-level `@stylistic/indent` disable because of this).

## Performance

4. **Prefer `projectService: true`** (typescript-eslint v8) over explicit
   `parserOptions.project` globs if not already used — it scales better in
   pnpm monorepos and avoids redundant program builds.

5. **Export a non-type-aware subset** (e.g. `@emilyeserven/eslint-config/fast`)
   without type-checked rules and without `better-tailwindcss`, for use in
   editor save hooks / lint-staged / per-file PostToolUse hooks where the
   full config's startup cost dominates single-file runs.

6. **Document `--cache --cache-strategy content` as the recommended invocation**
   (this repo now uses it; warm full-repo runs went from ~35s to ~2s).
