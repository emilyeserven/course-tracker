import type { Preview } from "@storybook/react-vite";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      // Off during the Vitest run: axe added per-story cost across ~226 stories
      // for no gate (it was 'todo' = report-only). The a11y panel in the
      // Storybook dev UI is unaffected. Revisit under #504 for a real a11y gate.
      test: "off",
    },
  },
};

export default preview;
