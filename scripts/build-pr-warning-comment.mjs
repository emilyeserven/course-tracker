#!/usr/bin/env node
//
// Build the body of the "PR warnings" sticky comment (posted/updated by
// .github/workflows/pr-warnings.yml). Warn-only and informational — it never
// fails the check; it just gives reviewers a single, always-current summary of:
//
//   1. ESLint *warnings* (severity 1) in the files this PR changed, and
//   2. New suppression directives added by the PR (lint/type ignore-or-disable
//      comments and skipped or focused tests) — reused verbatim from
//      scripts/check-new-suppressions.sh so the two stay in lockstep.
//
// Scope is file-granular ("files changed by this PR"), so a warning can sit on a
// line the PR didn't touch within a file it did — the heading says as much.
//
// Usage: node scripts/build-pr-warning-comment.mjs <base-sha-or-ref>
//   Diffs <base>...HEAD (three-dot, merge-base form), matching the contract
//   check-new-suppressions.sh already relies on. Requires the base commit to be
//   reachable (CI checks out with fetch-depth: 0).
//
// Output: writes the comment body to $RUNNER_TEMP/pr-warning-comment.md (falls
// back to the OS temp dir locally). The workflow's github-script step reads that
// file and upserts the comment by its leading marker.
//
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const MARKER = "<!-- pr-warning-report -->";
const LINT_EXTS = [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"];
const MAX_ROWS = 50; // keep well under GitHub's 65 KB comment cap

const repoRoot = process.cwd();
const tmpDir = process.env.RUNNER_TEMP || os.tmpdir();
const outPath = path.join(tmpDir, "pr-warning-comment.md");

const BASE = process.argv[2];
if (!BASE) {
  throw new Error("usage: build-pr-warning-comment.mjs <base-sha-or-ref>");
}

function git(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
    });
  }
  catch {
    return "";
  }
}

const hasExt = (f, exts) => exts.includes(path.extname(f));
const onDisk = f => existsSync(path.join(repoRoot, f)); // skip deleted files
const isGenerated = f =>
  f.endsWith("routeTree.gen.ts")
  || f.includes("/dist/")
  || f.startsWith(".claude/")
  || f === "pnpm-lock.yaml";

// Render a value safe for a single Markdown table cell: collapse newlines and
// neutralize the cell/markup characters (pipes and backticks) — mirrors the
// backtick handling in check-new-suppressions.sh.
const cell = s =>
  String(s)
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .replace(/`/g, "'")
    .trim();

// Files this PR changed (additions/modifications/renames — deletions excluded),
// narrowed to lintable, non-generated sources that still exist on disk.
const changedFiles = git([
  "diff",
  "--name-only",
  "--diff-filter=d",
  `${BASE}...HEAD`,
])
  .split("\n")
  .map(s => s.trim())
  .filter(Boolean)
  .filter(f => hasExt(f, LINT_EXTS) && onDisk(f) && !isGenerated(f));

// --- ESLint warnings in changed files --------------------------------------
// Run eslint only when there is something to lint: eslint with no path args does
// not no-op safely. Parse stdout regardless of exit code — a changed file may
// carry a real error (exit 1) or eslint may crash (exit 2); we still want to
// surface whatever warnings it did report.
let warningRows = [];
let eslintFailed = false;

if (changedFiles.length > 0) {
  const res = spawnSync(
    "pnpm",
    [
      "exec",
      "eslint",
      "--format",
      "json",
      "--no-warn-ignored",
      "--no-error-on-unmatched-pattern",
      ...changedFiles,
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    },
  );

  try {
    const results = JSON.parse(res.stdout || "[]");
    for (const file of results) {
      const rel = path.relative(repoRoot, file.filePath) || file.filePath;
      for (const m of file.messages) {
        if (m.severity !== 1) continue; // warnings only
        warningRows.push({
          file: rel,
          loc: `${m.line}:${m.column}`,
          rule: m.ruleId || "(unknown)",
          message: m.message,
        });
      }
    }
  }
  catch {
    // eslint produced no parseable JSON (e.g. a config crash). Don't claim a
    // clean bill of health — flag it so the comment shows something's off.
    eslintFailed = true;
  }
}

function renderEslintSection() {
  if (eslintFailed) {
    return "_⚠️ ESLint did not produce parseable output — check the lint job._";
  }
  if (warningRows.length === 0) {
    return "✅ No ESLint warnings in the files changed by this PR.";
  }

  const shown = warningRows.slice(0, MAX_ROWS);
  const lines = [
    "| File | Location | Rule | Message |",
    "|---|---|---|---|",
    ...shown.map(
      w =>
        `| \`${cell(w.file)}\` | ${cell(w.loc)} | \`${cell(w.rule)}\` | ${cell(w.message)} |`,
    ),
  ];
  if (warningRows.length > shown.length) {
    lines.push("");
    lines.push(`_…and ${warningRows.length - shown.length} more warning(s)._`);
  }
  return lines.join("\n");
}

// --- New suppression directives --------------------------------------------
// Reuse scripts/check-new-suppressions.sh untouched: it writes its markdown block
// to $GITHUB_STEP_SUMMARY. Point that at a temp file and discard stdout so its
// inline ::warning annotations don't double-fire (the pr-guards workflow already
// owns those). Tolerate a non-zero exit (set -euo pipefail can trip if its diff
// fails) by falling back to a neutral note.
function renderSuppressionsSection() {
  const supTmp = path.join(tmpDir, "pr-warning-suppressions.md");
  const res = spawnSync("scripts/check-new-suppressions.sh", [BASE], {
    cwd: repoRoot,
    env: {
      ...process.env,
      GITHUB_STEP_SUMMARY: supTmp,
    },
    stdio: ["ignore", "ignore", "ignore"],
  });

  if (res.status !== 0 || !existsSync(supTmp)) {
    return {
      markdown: "_Suppression-directive check unavailable._",
      clean: false,
    };
  }

  const raw = readFileSync(supTmp, "utf8").trim();
  // Demote the script's top-level "## …" heading to "### …" so it nests under
  // this comment's structure.
  const markdown = raw.replace(/^##\s/, "### ");
  return {
    markdown,
    clean: raw.includes("No new suppression directives"),
  };
}

// --- Assemble & write -------------------------------------------------------
const suppressions = renderSuppressionsSection();
const bothClean
  = !eslintFailed && warningRows.length === 0 && suppressions.clean;

const header = [
  MARKER,
  "## 🔎 PR warning report",
  "",
  "_Warn-only — lists ESLint warnings in the files this PR changed, plus new "
  + "suppression directives it adds. Refreshed on every push._",
  "",
].join("\n");

let body;
if (bothClean) {
  body = `${header}✅ No lint warnings or new suppressions in the files changed by this PR.\n`;
}
else {
  body = [
    header,
    "### ⚠️ ESLint warnings in files changed by this PR",
    "",
    renderEslintSection(),
    "",
    suppressions.markdown,
    "",
  ].join("\n");
}

writeFileSync(outPath, body);
console.log(
  `Wrote ${outPath} — ${warningRows.length} eslint warning(s) across `
  + `${changedFiles.length} changed file(s); suppressions clean: ${suppressions.clean}.`,
);
