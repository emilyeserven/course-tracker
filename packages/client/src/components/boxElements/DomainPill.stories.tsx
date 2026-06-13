import type { Meta, StoryObj } from "@storybook/react-vite";

import { within, expect } from "storybook/test";

import { DomainPill } from "./DomainPill";

const meta = {
  component: DomainPill,
  args: {
    children: "Frontend",
  },
} satisfies Meta<typeof DomainPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Frontend")).toBeInTheDocument();
  },
};
