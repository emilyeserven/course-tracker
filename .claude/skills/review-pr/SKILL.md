---
name: review-pr
description: >-
  Perform a thorough code review of a PR against project-specific checklists
  for this course-tracker monorepo. Use when the user invokes /review-pr.
  Accepts an optional PR number or URL as argument.
disable-model-invocation: true
allowed-tools: Bash, Read, Glob, Grep, ToolSearch, Skill
context: fork
---

# PR Review Skill (course-tracker)

You are a staff-level engineer performing a thorough code review of this pnpm monorepo (React client + Fastify middleware + shared types). Be constructive, specific, and concise. Every comment must be actionable. Praise what deserves praise.

**Scope: review the final code diff only.** Do not comment on commit history, commit messages, squash vs merge strategy, or how changes were broken up across commits. The branch will be squash-merged — individual commits are throwaway. Do not flag whitespace, formatting, or style-only changes mixed into the diff — pre-push hooks handle formatting automatically, so these are expected noise.

## PR Detection

Determine which PR to review based on `$ARGUMENTS`:

1. **If `$ARGUMENTS` contains a PR number or URL** — use that directly (e.g., `/review-pr 42` or `/review-pr https://github.com/org/repo/pull/42`)
2. **If `$ARGUMENTS` is empty** — run `~/.claude/scripts/git-pr-context.sh` to get branch context, then:
   - `PR STATUS: NONE`:
     1. Stage all changes, commit with a concise message, push with `git push -u origin HEAD`, and create a draft PR with `gh pr create --draft`
     2. Re-run `gh pr view --json number,title,headRefName,baseRefName,url,body,files` to capture the new PR's metadata
     3. If that fails or there are no changes to push → use the script's `FULL DIFF vs origin/<default>` as the diff and set `NO_PR=true`
   - `PR STATUS: EXISTS` but `REMOTE TRACKING: untracked` or unpushed local commits → stage, commit, and push changes
   - `PR STATUS: EXISTS` and up to date → proceed with that PR number

## Step 0: Install Dependencies

```bash
pnpm install
```

If the install fails, note it in the review output and continue — do not abort the entire review.

## Step 1: Gather Context

1. **Run `~/.claude/scripts/git-pr-review-context.sh <number>`** to fetch all PR data:
   - PR metadata, full diff, existing review comments, CI check status, and repo name
   - If `NO_PR=true`, skip this and use the `FULL DIFF vs origin/<default>` from `git-pr-context.sh` output

2. **Existing review comments** — from the script's `EXISTING REVIEWS AND COMMENTS` section:
   - Avoid duplicating feedback already given. If a comment thread is unresolved, note it but don't re-raise the same issue unless the code still has the problem
   - If prior reviewers requested changes, check whether those changes were addressed

3. **CI status** — from the script's `CI CHECKS` section:
   - Correlate failures with code issues found during review
   - Note passing/failing status in the Summary section

4. **Read changed files in full** — not just the diff hunks. For every file in the changeset, read the entire file so you understand the surrounding context. Use parallel Read calls.
   - **Skip these files**: `pnpm-lock.yaml`, `routeTree.gen.ts`, build output, other generated artifacts
   - **Classify each file by package**: `packages/client/`, `packages/middleware/`, `packages/types/` — this determines which checklists apply
   - **Large PRs (30+ changed source files)**: Prioritize new source files > modified logic files > renamed/moved files > test-only files

5. **Read project configuration** — `CLAUDE.md` and `package.json` from the project root are already in context. If relevant, also read `tsconfig.json` and package-level configs.

## Step 2: Look Up Library Docs via Context7

Scan **only the added/modified lines in the diff** for:
- New `import` statements or changed import specifiers
- Changes to `package.json` `dependencies`/`devDependencies`

For each library found in changed lines, use the Context7 MCP server:

1. Use `ToolSearch` to load the Context7 tools (`resolve-library-id` and `query-docs`)
2. Call `resolve-library-id` with the library name to get the Context7 library ID
3. Call `query-docs` with that ID and a topic relevant to how the library is used in the diff

Key libraries to look up when relevant: `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/react-form`, `fastify`, `drizzle-orm`, `@radix-ui/*`, `zod`.

If Context7 fails or is unavailable, note it and continue with training data as fallback. Don't present training data as authoritative for version-specific APIs.

## Step 3: Review

Evaluate every changed file against the applicable checklists. Read each checklist file before applying it.

### Always Apply
- `references/checklist-typescript.md` — all packages
- `references/checklist-security.md` — all packages

### If `packages/client/` Files Changed
- `references/checklist-client.md` — React, Radix, Tailwind, forms, fetch patterns
- `references/checklist-tanstack-router.md` — route definitions, navigation, loaders
- `references/checklist-tanstack-query.md` — query hooks, mutations, cache config
- `references/checklist-accessibility.md` — ARIA patterns, semantics, keyboard nav

### If `packages/middleware/` Files Changed
- `references/checklist-middleware.md` — Fastify routes, Drizzle queries, API patterns

### If `packages/middleware/src/db/schema.ts` or `drizzle.config.ts` Changed
- `references/checklist-drizzle-schema.md` — migration safety, destructive changes

For each finding:
- Cite the exact file and line number
- Explain **why** it matters, not just what's wrong
- Provide a code example for blocking issues
- Classify severity: **Blocking** (must fix), **Suggestion** (should consider), or **Nit** (minor)

## Step 4: Format Output

Use this exact template:

```markdown
# PR Review: [title] (#[number])

**Branch:** [head] → [base]
**Files changed:** [count]
**Checklists applied:** [list which checklists were used]
**Libraries consulted:** [list of libraries looked up via Context7, or "None"]

---

## Blocking (must fix before merge)

### (B1) Short descriptive title
**File:** `path/to/file.ts:LINE`
**Issue:** [One paragraph max explaining the problem and why it matters]
**Suggested fix:**
\```ts
// corrected code example
\```

### (B2) ...

## Suggestions (should consider)

### (S1) Short descriptive title
**File:** `path/to/file.ts:LINE`
**Issue:** [One paragraph max]

### (S2) ...

## Nits (minor, take or leave)

### (N1) Short descriptive title
**File:** `path/to/file.ts:LINE`
**Note:** [One sentence]

### (N2) ...

## What Looks Good
- [Specific positive observation about the code]
- [Another positive observation]

## Summary
[2-3 sentences: merge readiness verdict, key action items if any, overall impression]
```

**Formatting rules:**
- If a severity tier has no findings, include the heading with "None" underneath
- Always include the "What Looks Good" section — find something genuine to praise
- Use `file.ts:LINE` format for all file references
- Keep issue descriptions to one paragraph max
- Number findings within each tier: B1, B2, S1, S2, N1, N2, etc.
