#!/usr/bin/env node
//
// Fast scoped verification for the inner dev loop. Instead of the repo-wide
// `pnpm lint` / `pnpm typecheck` / full Vitest suite, this figures out what
// changed and runs ONLY the checks those changes affect:
//
//   - ESLint (cached, check-only) on the changed JS/TS files
//   - Incremental typecheck for the changed buildable package(s)
//   - One Vitest `related` run: the affected jsdom unit tests AND only the
//     Storybook stories that import a changed module (real headless browser)
//   - The middleware `node --test` suite when middleware changed (tiny/fast)
//
// Usage:
//   pnpm verify:changed                      # vs the working tree (default)
//   BASE=origin/master pnpm verify:changed   # branch-wide: changed since merge-base
//
// This is the iteration loop, NOT the commit gate. Before committing, run the
// full gate:
//   pnpm typecheck && pnpm lint && pnpm --filter=@emstack/client exec vitest run
//
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const LINT_EXTS = [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"];
const TEST_EXTS = [".js", ".jsx", ".ts", ".tsx"];

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

// Working tree + staged + untracked (and, with BASE set, everything this branch
// changed vs the merge-base) — deduped.
function changedFiles() {
  const set = new Set();
  const add = out =>
    out
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(f => set.add(f));

  if (process.env.BASE) {
    add(git(["diff", "--name-only", `${process.env.BASE}...HEAD`]));
  }
  add(git(["diff", "--name-only"])); // unstaged
  add(git(["diff", "--name-only", "--cached"])); // staged
  add(git(["ls-files", "--others", "--exclude-standard"])); // untracked
  return [...set];
}

const inPkg = (f, pkg) => f.startsWith(`packages/${pkg}/`);
const hasExt = (f, exts) => exts.includes(path.extname(f));
const onDisk = f => existsSync(path.join(repoRoot, f)); // skip deleted files
const isGenerated = f => f.endsWith("routeTree.gen.ts") || f.includes("/dist/");

const failures = [];
function run(label, cmd, args) {
  console.log(`\n▶ ${label}`);
  console.log(`  $ ${cmd} ${args.join(" ")}`);
  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: repoRoot,
  });
  if (res.status !== 0) failures.push(label);
}

const all = changedFiles();

const clientChanged = all.some(f => inPkg(f, "client"));
const middlewareChanged = all.some(f => inPkg(f, "middleware"));
const typesChanged = all.some(f => inPkg(f, "types"));

// Lintable files that still exist (drop deleted + generated output).
const lintFiles = all.filter(
  f => hasExt(f, LINT_EXTS) && onDisk(f) && !isGenerated(f),
);

// `related` maps changed CLIENT source files -> the unit tests and stories that
// import them. (types/* resolves to the built package, not source, so it can't
// be mapped this way — a types change leans on the typecheck below instead.)
const relatedInputs = all
  .filter(
    f =>
      inPkg(f, "client")
      && hasExt(f, TEST_EXTS)
      && onDisk(f)
      && !isGenerated(f),
  )
  .map(f => path.join(repoRoot, f));

console.log("verify:changed — scoped inner-loop verification");
console.log(
  `Changed files: ${all.length}`
  + ` (client: ${clientChanged}, middleware: ${middlewareChanged}, types: ${typesChanged})`,
);

let ran = false;

// 1. Lint only the changed files (the per-edit PostToolUse hook already --fix'd
//    them; this is the check-only verify pass, like CI).
if (lintFiles.length) {
  ran = true;
  run(`Lint ${lintFiles.length} changed file(s)`, "pnpm", [
    "exec",
    "eslint",
    "--cache",
    "--cache-location",
    "node_modules/.cache/eslint/",
    "--cache-strategy",
    "content",
    "--no-warn-ignored",
    ...lintFiles,
  ]);
}

// 2. Typecheck (incremental). A types change can break any dependent, so fall
//    back to the full typecheck; otherwise build types once, then check the
//    changed dependent package(s).
if (typesChanged) {
  ran = true;
  run("Typecheck (types changed → full)", "pnpm", ["typecheck"]);
}
else if (clientChanged || middlewareChanged) {
  ran = true;
  run("Build @emstack/types", "pnpm", ["--filter=@emstack/types", "build"]);
  if (clientChanged) {
    run("Typecheck @emstack/client", "pnpm", [
      "--filter=@emstack/client",
      "run",
      "typecheck",
    ]);
  }
  if (middlewareChanged) {
    run("Typecheck @emstack/middleware", "pnpm", [
      "--filter=@emstack/middleware",
      "run",
      "typecheck",
    ]);
  }
}

// 3. Client tests: one Vitest `related` run covers BOTH projects — the affected
//    jsdom unit tests and only the touched Storybook stories (browser).
if (relatedInputs.length) {
  ran = true;
  run(
    `Vitest related — unit tests + touched stories (${relatedInputs.length} file(s))`,
    "pnpm",
    [
      "--filter=@emstack/client",
      "exec",
      "vitest",
      "related",
      "--run",
      ...relatedInputs,
    ],
  );
}

// 4. Middleware suite is tiny — run it whole when middleware changed.
if (middlewareChanged) {
  ran = true;
  run("Middleware tests (node --test)", "pnpm", [
    "--filter=@emstack/middleware",
    "test",
  ]);
}

const fullGate
  = "pnpm typecheck && pnpm lint && pnpm --filter=@emstack/client exec vitest run";

console.log("\n──── verify:changed summary ────");
if (!ran) {
  console.log("No changed files require verification. ✅");
  process.exit(0);
}
if (failures.length) {
  console.log(`❌ ${failures.length} check(s) failed:`);
  failures.forEach(f => console.log(`   - ${f}`));
  console.log(`\nFull gate (run before committing): ${fullGate}`);
  process.exit(1);
}
console.log("✅ All scoped checks passed.");
console.log(`Before committing, run the full gate: ${fullGate}`);
