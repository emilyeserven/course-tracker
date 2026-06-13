import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { ProgressBar } from "./ProgressBar";

const meta = {
  component: ProgressBar,
  args: {
    progressCurrent: 3,
    progressTotal: 10,
  },
  decorators: [
    Story => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const fill = canvasElement.querySelector<HTMLElement>("div[style*='width']");
    // Assert the inline style — computed style resolves the % to pixels.
    await expect(fill?.style.width).toBe("30%");
  },
};

export const Inactive: Story = {
  args: {
    progressCurrent: 2,
    progressTotal: 4,
    status: "inactive",
  },
};

export const Complete: Story = {
  args: {
    progressCurrent: 5,
    progressTotal: 5,
  },
  play: async ({
    canvasElement,
  }) => {
    const fill = canvasElement.querySelector<HTMLElement>("div[style*='width']");
    await expect(fill?.style.width).toBe("100%");
  },
};

// With no current progress the component renders nothing.
export const Empty: Story = {
  args: {
    progressCurrent: 0,
    progressTotal: 10,
  },
  play: async ({
    canvasElement,
  }) => {
    await expect(canvasElement.querySelector("div[style*='width']")).toBeNull();
  },
};
