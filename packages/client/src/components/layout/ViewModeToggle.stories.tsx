import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { ViewModeToggle } from "./ViewModeToggle";

const meta: Meta<typeof ViewModeToggle> = {
  component: ViewModeToggle,
  args: {
    viewMode: "grid",
    onChange: fn(),
    gridLabel: "Grid view",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const GridSelected: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Grid view",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};

export const TableSelected: Story = {
  args: {
    viewMode: "table",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Table view",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};

export const ClickSwitchesMode: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Table view",
    }));
    await expect(args.onChange).toHaveBeenCalledWith("table");
  },
};
