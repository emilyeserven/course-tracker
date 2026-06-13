import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { InfoRow } from "./InfoRow";

const meta = {
  component: InfoRow,
  args: {
    header: "Details",
    children: (
      <>
        <span>First column</span>
        <span>Second column</span>
      </>
    ),
  },
} satisfies Meta<typeof InfoRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Details")).toBeInTheDocument();
    await expect(canvas.getByText("First column")).toBeInTheDocument();
  },
};

export const WithoutHeader: Story = {
  args: {
    header: undefined,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("First column")).toBeInTheDocument();
    await expect(canvas.queryByText("Details")).not.toBeInTheDocument();
  },
};

// `condition={false}` short-circuits to null — nothing renders.
export const Hidden: Story = {
  args: {
    condition: false,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("First column")).not.toBeInTheDocument();
  },
};
