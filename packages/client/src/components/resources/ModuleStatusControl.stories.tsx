import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { ModuleStatusControl } from "./ModuleStatusControl";

import { constrainedStoryDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof ModuleStatusControl> = {
  component: ModuleStatusControl,
  args: {
    status: "unstarted",
    disabled: false,
    onChange: fn(),
  },
  decorators: [constrainedStoryDecorator("max-w-xs")],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Unstarted: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: /Status: Unstarted/i,
      }),
    ).toBeInTheDocument();
  },
};

export const InProgress: Story = {
  args: {
    status: "in_progress",
  },
};

export const Complete: Story = {
  args: {
    status: "complete",
  },
};

export const PicksFromMenu: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: /Status: Unstarted/i,
      }),
    );
    // The popover content portals to the body, so query the whole document.
    const screen = within(document.body);
    await userEvent.click(
      await screen.findByRole("button", {
        name: "Complete",
      }),
    );
    await expect(args.onChange).toHaveBeenCalledWith("complete");
  },
};
