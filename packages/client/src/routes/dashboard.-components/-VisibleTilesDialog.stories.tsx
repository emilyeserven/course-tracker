import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, screen, userEvent } from "storybook/test";

import { VisibleTilesDialog } from "./-VisibleTilesDialog";

import { makeLayout } from "@/test-utils/settingsFixtures";

const meta: Meta<typeof VisibleTilesDialog> = {
  component: VisibleTilesDialog,
  args: {
    open: true,
    layout: makeLayout(),
    onOpenChange: fn(),
    onToggleTile: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// The tile-visibility checklist (dialog content portals to the body).
export const Open: Story = {
  play: async ({
    args,
  }) => {
    await expect(await screen.findByText("Visible tiles")).toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox");
    await expect(checkboxes.length).toBeGreaterThan(0);
    // Toggling a tile calls back to the parent.
    await userEvent.click(checkboxes[0]);
    await expect(args.onToggleTile).toHaveBeenCalled();
  },
};

// Closed: nothing rendered.
export const Closed: Story = {
  args: {
    open: false,
  },
  play: async () => {
    await expect(screen.queryByText("Visible tiles")).not.toBeInTheDocument();
  },
};
