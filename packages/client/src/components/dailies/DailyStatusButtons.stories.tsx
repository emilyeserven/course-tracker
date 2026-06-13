import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { DailyStatusButtons } from "./DailyStatusButtons";

const meta: Meta<typeof DailyStatusButtons> = {
  component: DailyStatusButtons,
  args: {
    onChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentStatus: "goal",
  },
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Exceeded",
    }));
    await expect(args.onChange).toHaveBeenCalledWith("exceeded");
  },
};

export const IconOnly: Story = {
  args: {
    currentStatus: "touched",
    iconOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    currentStatus: "goal",
    disabled: true,
  },
};
