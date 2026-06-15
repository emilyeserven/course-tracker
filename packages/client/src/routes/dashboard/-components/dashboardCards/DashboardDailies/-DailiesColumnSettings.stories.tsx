import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { DailiesColumnSettings } from "./-DailiesColumnSettings";

import { makeTile } from "@/test-utils/dashboardFixtures";

const meta: Meta<typeof DailiesColumnSettings> = {
  component: DailiesColumnSettings,
  args: {
    tile: makeTile("doNow"),
    onUpdateTile: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// The per-card column show/hide toggles. The routine column defaults off, so
// clicking it asks to enable that column for this tile.
export const Columns: Story = {
  play: async ({
    canvasElement, args,
  }) => {
    const canvas = within(canvasElement);
    const routine = canvas.getByRole("switch", {
      name: /routine/i,
    });
    await expect(routine).toHaveAttribute("aria-checked", "false");
    await userEvent.click(routine);
    await expect(args.onUpdateTile).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: expect.objectContaining({
          routine: true,
        }),
      }),
    );
  },
};
