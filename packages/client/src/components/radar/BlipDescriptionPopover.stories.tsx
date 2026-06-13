import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BlipDescriptionPopover } from "./BlipDescriptionPopover";

const meta: Meta<typeof BlipDescriptionPopover> = {
  component: BlipDescriptionPopover,
  args: {
    value: "Container orchestration",
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Edit blip description",
      }),
    ).toBeInTheDocument();
  },
};
