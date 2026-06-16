// Shared helpers for the repo's Node build scripts (verify-changed,
// build-pr-warning-comment). Both narrow a list of changed files down to lintable
// sources that still exist on disk, so the file filters live here once.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

export const repoRoot = process.cwd();
export const LINT_EXTS = [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"];

// Run git, returning "" on failure (e.g. an unreachable base ref).
export function git(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
    });
  }
  catch {
    return "";
  }
}

export const hasExt = (f, exts) => exts.includes(path.extname(f));
export const onDisk = f => existsSync(path.join(repoRoot, f)); // skip deleted files
