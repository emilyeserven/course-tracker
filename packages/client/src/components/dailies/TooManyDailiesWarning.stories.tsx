import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { TooManyDailiesWarning } from "./TooManyDailiesWarning";

const meta = {
  component: TooManyDailiesWarning,
  args: {
    activeCount: 6,
    limit: 5,
  },
} satisfies Meta<typeof TooManyDailiesWarning>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AtLimit: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", {
        name: "Too many active dailies",
      }),
    ).toHaveTextContent("6 / 5");
  },
};

/** Below the limit the warning renders nothing. */
export const UnderLimit: Story = {
  args: {
    activeCount: 2,
    limit: 5,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
  },
};
