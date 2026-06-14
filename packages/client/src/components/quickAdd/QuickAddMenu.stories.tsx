import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { QuickAddMenu } from "./QuickAddMenu";

const meta: Meta<typeof QuickAddMenu> = {
  component: QuickAddMenu,
  args: {
    onSelect: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// The trigger renders inline in the canvas.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Quick Add")).toBeInTheDocument();
  },
};

// Opening the menu reveals the grouped options (portaled to document.body);
// picking one fires onSelect with that option's key.
export const Opens: Story = {
  play: async ({
    canvasElement,
    args,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText("Quick Add"));
    const body = within(document.body);
    await expect(await body.findByText("Send to")).toBeInTheDocument();
    await expect(await body.findByText("New record")).toBeInTheDocument();
    await userEvent.click(
      await body.findByRole("menuitem", {
        name: "Resource",
      }),
    );
    await expect(args.onSelect).toHaveBeenCalledWith("resource");
  },
};
