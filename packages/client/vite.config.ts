/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import path from "path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

const dirname
  = typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({
  mode,
}) => ({
  preview: {
    port: 4173,
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  plugins: [
    ...(mode !== "test"
      ? [tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      })]
      : []),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Repo-root files bundled into the client (e.g. CHANGELOG.md). A relative
      // path is autofixed into the bare `emstack/...` package import, which
      // doesn't resolve — an alias keeps it pointing at the monorepo root.
      "@root": path.resolve(__dirname, "../.."),
    },
  },
  optimizeDeps: {
    // Pre-bundle the heavy shared deps once up front so each browser-mode story
    // file doesn't trigger on-demand Vite transforms — a source of suite
    // slowness and the parallelism races tracked in #504.
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/react-router",
      "lucide-react",
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit-tests",
          globals: true,
          environment: "jsdom",
          include: ["**/*.test.{ts,tsx,js,jsx}"],
          exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/cypress/**",
            "**/.{idea,git,cache,output,temp}/**",
            "**/*.stories.{js,jsx,ts,tsx}",
          ],
          setupFiles: ["./setupTests.js"],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          // Quarantined: these stories intermittently fail the browser-mode run
          // under the suite-wide parallelism races tracked in #504 (not bugs in
          // the stories themselves — they fail to *load*, not on assertions).
          // The `.stories.tsx` files still render in Storybook; they're only
          // skipped in the Vitest run. Re-enable once the suite is stable — #536.
          // NB: setting `exclude` overrides Vitest's defaults, so the standard
          // ignores are re-listed here (as the unit-tests project does).
          exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/cypress/**",
            "**/.{idea,git,cache,output,temp}/**",
            "**/src/routes/settings/-components/advanced/-DataToolsSection.stories.tsx",
            "**/src/routes/settings/-components/connections/-TodoistSection.stories.tsx",
            "**/src/components/radar/RadarConfigIllustrations.stories.tsx",
          ],
          // Block real /api network calls during the run (stories seed query
          // data instead) — kills the ECONNREFUSED proxy round-trips/noise.
          setupFiles: ["./.storybook/vitest.setup.ts"],
          // Cap concurrency. Unbounded file parallelism hard-deadlocked the
          // browser suite (#504): a >28-min crawl at low CPU with resources
          // free, no summary. This bound prevents that runaway and is what CI
          // uses. It is not a full fix, though — on throttled/shared hosts even
          // bounded parallelism can still crawl (reproduced under #504), so a
          // trustworthy *full* local run still passes `--no-file-parallelism`
          // (fully serial); day-to-day, prefer `pnpm verify:changed`.
          maxWorkers: 2,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              // Headless Chromium in CI/containers: avoid the sandbox + the
              // /dev/shm path (it can stall under contention); --disable-gpu
              // is a free win headless.
              launch: {
                args: [
                  "--no-sandbox",
                  "--disable-dev-shm-usage",
                  "--disable-gpu",
                ],
              },
            }),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
}));
