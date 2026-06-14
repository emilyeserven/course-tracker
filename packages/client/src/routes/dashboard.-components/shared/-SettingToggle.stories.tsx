import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { SettingToggle } from "./-SettingToggle";

const meta: Meta<typeof SettingToggle> = {
  component: SettingToggle,
  args: {
    label: "Show project",
    checked: false,
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// The standalone switch row used in card settings flyouts.
export const Toggle: Story = {
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
