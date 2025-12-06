// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import emstackConfig from "@emilyeserven/eslint-config";
import tseslint from "typescript-eslint";

export default tseslint.config([
  ...emstackConfig,
  {
    ignores: ["pnpm-lock.yaml"],
    settings: {
      "better-tailwindcss": {
        entryPoint: "./packages/client/src/index.css",
      },
    },
  },
]);
