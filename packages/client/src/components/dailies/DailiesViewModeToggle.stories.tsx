import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { DailiesViewModeToggle } from "./DailiesViewModeToggle";

const meta: Meta<typeof DailiesViewModeToggle> = {
  component: DailiesViewModeToggle,
  args: {
    onChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const TableSelected: Story = {
  args: {
    mode: "table",
  },
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "List view",
    }));
    await expect(args.onChange).toHaveBeenCalledWith("list");
  },
};

export const ListSelected: Story = {
  args: {
    mode: "list",
  },
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
