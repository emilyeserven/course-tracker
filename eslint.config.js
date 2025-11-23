// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import emstackConfig from "@emilyeserven/eslint-config";
import tseslint from "typescript-eslint";

export default tseslint.config([
  ...emstackConfig,
    {
        rules: {
            "react/no-children-prop": ["error", {
                "allowFunctions": true
            }]
        }
    }
]);
