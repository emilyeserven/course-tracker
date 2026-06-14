---
name: audit-guards
description: >-
  Audit the project's manually-added "guards" — the escape hatches that exist to
  work around a problem and should be removed once that problem is fixed: fallow
  ignore comments (`// fallow-ignore-*`), the ignore lists in `.fallowrc.json`
  (`duplicates.ignore`, `ignoreDependencies`, `entry`), and `pnpm.overrides` in
  the root `package.json`. For each, decides whether it is still load-bearing or
  has gone stale, and reports removable ones with ready-to-run fixes. Reads and
  reports only — it never deletes a guard on its own. Use when asked to "check
  fallow ignores", "are the pnpm overrides still needed", "prune stale
  suppressions/overrides", "clean up ignores", or via /audit-guards. Accepts an
  optional scope (a package path, or `fallow`/`overrides` to run just one half).
---

# Audit guards (course-tracker)

A **guard** is anything we added by hand to silence a tool or pin a dependency
*because of a specific problem* — a fallow false positive, a known-bad transitive
version, a CVE. Guards are debt: once the underlying problem is gone, the guard
is dead weight that hides the next real issue. This skill finds guards that have
outlived their cause.

**This skill reads and reports only.** It never deletes a comment, edits
`.fallowrc.json`, or removes an override on its own — it hands you the exact edit
or command. Run from the repo root. If given a scope arg, limit accordingly
(`fallow` = guards A1–A3 only, `overrides` = guard B only, a path = scope the
fallow scans to that path).

## What counts as a guard here

| Guard | Where | How it goes stale |
|---|---|---|
| A1. Inline fallow ignores | `// fallow-ignore-next-line <kind>` / `// fallow-ignore-file <kind>` in source | The issue it suppressed is gone (code deleted/refactored) |
| A2. Security-sink ignores | `// fallow-ignore-* security-sink` | The flagged sink call is gone — **not** caught by A1's stale check (see below) |
| A3. `.fallowrc.json` ignore lists | `duplicates.ignore`, `ignoreDependencies`, `entry`, plus `--ignore*` config | Glob matches no file; ignored dep no longer declared |
| B. pnpm overrides | `pnpm.overrides` in root `package.json` | Natural resolution now already satisfies the constraint |

---

## A. fallow guards

### A1 — Stale inline suppressions (non-security)

fallow self-detects ignore comments and `@expected-unused` tags that no longer
match any issue:

```bash
pnpm exec fallow dead-code --stale-suppressions --quiet
pnpm exec fallow dead-code --stale-suppressions --format json --quiet   # full list
```

For each reported entry, decide between two fixes — **do not blindly delete**:

- **Genuinely stale** (the code the comment guarded is gone): delete the comment.
- **Polluted directive line** (the token works but extra words on the *same line*
  are misread as issue-kinds): fallow parses **every whitespace-token after
  `fallow-ignore-*`** as a candidate issue-kind. A rationale like
  `// fallow-ignore-file security-sink — not exploitable` makes fallow flag `—`,
  `not`, `exploitable` as stale. The suppression still works, but it's noise.
  **Fix: move the prose to its own comment line(s); leave only the kind token(s)
  on the directive line.** This is the repo convention — always write:

  ```ts
  // Rationale on its own line(s), as many as you need.
  // fallow-ignore-next-line <kind>
  theSinkCall();
  ```

  Look for the tell in the report: `('<word>' is not a recognized fallow issue
  kind. Other tokens on this line still apply.)` → it's pollution, not staleness.

### A2 — Stale security-sink suppressions

Security findings come only from the opt-in `fallow security` command, so the A1
stale check does **not** cover `security-sink` ignores. Verify those separately
with a strip-and-rescan, run in a throwaway git worktree so the real tree is
never touched:

```bash
# 1. Baseline: which sinks are currently suppressed?
grep -rn "fallow-ignore.*security-sink" packages/ | tee /tmp/guard-sec-ignores.txt

# 2. Scratch worktree on the current HEAD
git worktree add -d /tmp/guard-scan HEAD
# 3. Strip every security-sink ignore line in the scratch copy
grep -rl "fallow-ignore.*security-sink" /tmp/guard-scan/packages | \
  xargs sed -i '' '/fallow-ignore.*security-sink/d'
# 4. Re-scan: any sink that was real reappears here
pnpm --dir /tmp/guard-scan exec fallow security --format json --quiet 2>/dev/null | \
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>JSON.parse(s).security_findings.forEach(f=>console.log(f.path+":"+f.line,f.category)))'
# 5. Clean up
git worktree remove --force /tmp/guard-scan
```

Cross-reference: every file:line in `/tmp/guard-sec-ignores.txt` should reappear
in step 4's output (line numbers shift by the deleted lines — match by file +
nearby sink). **A suppressed location that does NOT reappear is stale** → the
sink is gone, delete the comment. `sed -i ''` is BSD/macOS syntax (see global
shell conventions); on Linux use `sed -i`.

Quick non-destructive sanity check before the full rescan: read each suppressed
file and confirm a real sink call (`fetch`, `spawn`, `exec*`, `path.join`,
`path.resolve`, `new RegExp`, …) still sits on the guarded line. No sink there =
almost certainly stale.

### A3 — `.fallowrc.json` ignore lists

Read `.fallowrc.json` (it contains `//` comments — parse as JSONC, or just read
it manually). Check each entry:

- **`duplicates.ignore`** and **`entry`** globs → each must match ≥1 file. A glob
  that matches nothing is stale (file moved/deleted). Test a glob:
  `git ls-files '<glob>' | head` (or `ls` the literal paths).
- **`ignoreDependencies`** → each must still be a declared dependency. Check:
  `grep -rn '"<dep>"' package.json packages/*/package.json`. Not found anywhere =
  the dep is gone, drop the ignore.

Report stale entries with the exact line to remove. Don't touch `health.*`
thresholds or `ignoreExportsUsedInFile` — those are policy knobs, not guards.

---

## B. pnpm overrides

Read `pnpm.overrides` from the root `package.json`. Each override forces a
version of a (usually transitive) dependency, almost always to dodge a bug or
CVE. It's **redundant** once every dependent's natural range already resolves to
something satisfying the constraint.

Test each override non-destructively in a scratch worktree:

```bash
git worktree add -d /tmp/guard-ovr HEAD
cd /tmp/guard-ovr

# For each override key <pkg> with constraint <range>:
#   a) See who pulls it in and what they ask for:
pnpm why <pkg>
#   b) Remove just that override key from package.json, then:
pnpm install --lockfile-only --ignore-scripts
#   c) Read the resolved version now chosen for <pkg>:
node -e 'console.log(require("./pnpm-lock.yaml") ? "see lockfile" : "")'  # or:
grep -A2 "/<pkg>@" pnpm-lock.yaml | head
```

Decide:

- Resolved-without-override **satisfies** `<range>` (e.g. override `esbuild:
  >=0.28.1`, natural resolves to `0.28.5`) → **override is redundant, removable.**
- Resolved-without-override **violates** `<range>` (drops to a vulnerable/broken
  version) → **still load-bearing, keep it.**

Clean up: `cd` back to the repo root and `git worktree remove --force
/tmp/guard-ovr`. The real lockfile is never modified by this check.

For CVE-motivated overrides, also confirm the natural version is past the
advisory's patched release — the `security-audit` skill / `pnpm audit` can map a
package to its advisory. Current overrides as of writing: `picomatch`,
`esbuild`, `shell-quote` (all unannotated — note in the report that adding a
one-line rationale comment near each would make future audits faster, though
`pnpm.overrides` can't hold inline JSON comments, so record the reason in a PR or
a `docs/` note).

---

## Output

Produce one report with two sections (or just the scoped half):

```
## fallow guards
- STALE  packages/foo/bar.ts:12  // fallow-ignore-next-line unused-export  → delete (issue resolved)
- NOISE  packages/baz.ts:1       prose on directive line → move rationale to its own line
- OK     packages/x.ts:80        security-sink still fires (reappeared in rescan)
- STALE  .fallowrc.json:42       ignoreDependencies "foo" — not declared anywhere → remove

## pnpm overrides
- REDUNDANT  esbuild >=0.28.1  → natural resolves 0.28.5, satisfies; safe to remove
- KEEP       shell-quote >=1.8.4 → natural resolves 1.7.3 (< constraint); still needed
```

Then hand the user the concrete edits/commands and **ask before applying** any
removal. If guards are removed, re-run the relevant verifier (`fallow security`,
`fallow dead-code --stale-suppressions`, or `pnpm install`) to confirm nothing
regressed, and surface real findings that a stale guard had been masking.
