import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, screen, userEvent, within } from "storybook/test";

import { CardSettingsFlyout } from "./-DashboardCardSettings";

import { makeTile } from "@/test-utils/dashboardFixtures";

const meta: Meta<typeof CardSettingsFlyout> = {
  component: CardSettingsFlyout,
  args: {
    tile: makeTile("todoist"),
    onUpdateTile: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// The gear flyout: opening it reveals the Auto/Fixed height chooser (portaled).
export const Flyout: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: /card settings/i,
      }),
    );
    await expect(await screen.findByText("Height")).toBeInTheDocument();
  },
};
