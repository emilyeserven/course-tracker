// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
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
        entryPoint: "./packages/client/src/index.css",
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
          ],
        },
      ],
    },
  },
]);
