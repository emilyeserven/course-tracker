import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, screen, userEvent, within } from "storybook/test";

import { CardSettingsFlyout, SettingToggle } from "./-DashboardCardSettings";

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

// The standalone switch row used in the flyout's per-card settings.
export const Toggle: StoryObj<typeof SettingToggle> = {
  render: args => <SettingToggle {...args} />,
  args: {
    label: "Show project",
    checked: false,
    onChange: fn(),
  },
  play: async ({
    canvasElement, args,
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", {
      name: /show project/i,
    });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.click(toggle);
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};
