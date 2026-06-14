import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { describe, expect, test } from "vitest";

// Structure guard: every component must live in a themed subdirectory
// (ui/, dialogs/, layout/, listControls/, …). No component file may sit
// directly in components/. New shadcn primitives land in ui/ automatically
// (components.json aliases.ui → @/components/ui). See packages/client/CLAUDE.md.
//
// A pure import-path lint rule can't tell a folder-barrel import
// (@/components/dialogs) from a loose-file import (@/components/Foo), so this
// filesystem assertion is the real enforcement.
const componentsDir = path.dirname(fileURLToPath(import.meta.url));

// This test file is the one intentional exception — it has to live here to
// resolve the directory it guards.
const ALLOWED_FILES = new Set(["structure.test.ts"]);

describe("components/ directory structure", () => {
  test("contains only subdirectories — no loose component files", () => {
    const looseFiles = readdirSync(componentsDir, {
      withFileTypes: true,
    })
      .filter(entry => entry.isFile() && !ALLOWED_FILES.has(entry.name))
      .map(entry => entry.name);

    expect(
      looseFiles,
      "Move these into a themed subdirectory (ui/ for shadcn primitives, "
      + "dialogs/, layout/, listControls/, or a feature folder): "
      + `${looseFiles.join(", ")}`,
    ).toEqual([]);
  });
});
