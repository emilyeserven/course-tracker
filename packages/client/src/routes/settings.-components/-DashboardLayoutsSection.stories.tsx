import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DashboardLayoutsSection } from "./-DashboardLayoutsSection";

import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeLayout } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";
import { queryKeys } from "@/utils/queryKeys";

// Seeds one tab layout + one saved preset so both lists render.
function seededClient() {
  return seededQueryClient([
    [
      queryKeys.dashboardLayouts.list(),
      [
        makeLayout({
          name: "Main",
        }),
        makeLayout({
          id: "layout-2",
          name: "Reading preset",
          isTemplate: true,
          position: null,
        }),
      ],
    ],
  ]);
}

const meta = {
  component: DashboardLayoutsSection,
  decorators: [queryStubDecorator(seededClient)],
} satisfies Meta<typeof DashboardLayoutsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// The tabs + saved-presets lists, each with its row actions menu.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: "Tabs",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("heading", {
        name: "Saved presets",
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Main")).toBeInTheDocument();
    await expect(canvas.getByText("Reading preset")).toBeInTheDocument();
  },
};

// Before the layouts query resolves the section shows its loading placeholder.
export const Loading: Story = {
  decorators: [queryStubDecorator()],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Loading...")).toBeInTheDocument();
  },
};
