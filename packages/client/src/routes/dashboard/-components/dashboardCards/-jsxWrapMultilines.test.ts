import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

// Regression guard for #517. A multiline JSX *prop value* left unwrapped
// (`settings={<Flyout tile={…} onUpdateTile={…} />}`) makes
// `@stylistic/jsx-closing-bracket-location` (tag-aligned `/>`) and
// `@stylistic/indent` fight over the closing bracket: `eslint --fix` cannot
// converge, emits `ESLintCircularFixesWarning`, and leaves a residual
// `@stylistic/indent` error. eslint.config.js fixes this by forcing
// jsx-wrap-multilines `prop`/`propertyValue: "parens-new-line"` so the value is
// wrapped (`settings={(\n  <Flyout … />\n)}`) — the shape used across the
// dashboard cards. `pnpm lint` can't catch a regression here (committed code is
// already wrapped), so this exercises the fix transform directly.
const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../../../../../../../..");
const virtualFile = path.join(repoRoot, "packages/client/src/__jsx_wrap_probe__.tsx");

// Prettier/format-on-save collapses these onto one line; eslint --fix must
// re-expand each to a stable, lint-clean shape with no circular fixes.
const collapsedSamples = [
  // JSX prop value with multiple props (the `settings={…}` dashboard pattern).
  "export const A = () => "
  + "<Card settings={<Flyout tile={1} onUpdateTile={() => undefined} />} />;\n",
  // Same, but the host element also has children.
  "export const B = () => "
  + "<Card settings={<Flyout tile={1} onUpdateTile={() => undefined} />}>x</Card>;\n",
];

async function fixThenLint(code: string) {
  const fixer = new ESLint({
    cwd: repoRoot,
    fix: true,
  });
  const [fixed] = await fixer.lintText(code, {
    filePath: virtualFile,
  });
  const output = fixed.output ?? code;

  const linter = new ESLint({
    cwd: repoRoot,
  });
  const [relinted] = await linter.lintText(output, {
    filePath: virtualFile,
  });
  const stylisticErrors = relinted.messages
    .filter(m => m.ruleId?.startsWith("@stylistic/"))
    .map(m => `${m.ruleId} (L${m.line})`);

  // Idempotency: a second fix pass must be a no-op (the circular-fix loop is gone).
  const [refixed] = await fixer.lintText(output, {
    filePath: virtualFile,
  });
  const settled = refixed.output ?? output;

  return {
    output,
    settled,
    stylisticErrors,
  };
}

describe("jsx-wrap-multilines converges on JSX prop values (#517)", () => {
  for (const [i, sample] of collapsedSamples.entries()) {
    test(`sample ${i} re-expands with no residual @stylistic errors`, async () => {
      const {
        output, settled, stylisticErrors,
      } = await fixThenLint(sample);
      expect(stylisticErrors).toEqual([]);
      expect(settled, "eslint --fix must be idempotent — no circular fixes").toBe(output);
    });
  }
});
