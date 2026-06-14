// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import path from "node:path";

import emstackConfig from "@emilyeserven/eslint-config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  {
    ignores: [".claude/"],
  },
  ...emstackConfig,
  {
    ignores: ["pnpm-lock.yaml"],
    settings: {
      "better-tailwindcss": {
        entryPoint: path.resolve(import.meta.dirname, "packages/client/src/index.css"),
      },
    },
  },
  {
    files: ["packages/gateway/**/*.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["packages/client/src/routes/**/*.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["packages/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@emstack/types/*"],
              message:
                "Import from \"@emstack/types\" — subpath imports bypass the package's exports map.",
            },
            {
              // Components moved out of the components/ root into themed
              // subdirectories. No component lives directly in components/ —
              // a structure test (components/structure.test.ts) enforces this.
              // These globs catch reverts to the old loose-file paths.
              group: [
                "@/components/calendar",
                "@/components/combobox",
                "@/components/input",
                "@/components/input-group",
                "@/components/popover",
                "@/components/radio-group",
                "@/components/sonner",
                "@/components/textarea",
                "@/components/ConfirmDialog",
                "@/components/UnsavedChangesDialog",
                "@/components/LayoutNameDialog",
                "@/components/EditModalFooter",
                "@/components/quickAdd",
                "@/components/EntityStates",
                "@/components/FilterOptionCount",
                "@/components/ListPageControls",
                "@/components/EditFormActions",
                "@/components/LayoutMenuActions",
              ],
              message:
                "Import from the component's themed subdirectory instead "
                + "(e.g. @/components/ui/input, @/components/dialogs/ConfirmDialog, "
                + "@/components/listControls/EntityStates, @/components/layout/EditFormActions). "
                + "No component lives directly in components/.",
            },
          ],
        },
      ],
    },
  },
]);
