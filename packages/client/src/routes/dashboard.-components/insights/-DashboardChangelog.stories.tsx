import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { DashboardChangelog } from "./-DashboardChangelog";

import { makeTile } from "@/test-utils/dashboardFixtures";

const meta: Meta<typeof DashboardChangelog> = {
  component: DashboardChangelog,
  args: {
    tile: makeTile("changelog"),
    onUpdateTile: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Renders the build-time CHANGELOG.md (no fetch). We don't assert on specific
// entries since the content changes over time.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Changelog"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", {
        name: /view on github/i,
      }),
    ).toBeInTheDocument();
  },
};
