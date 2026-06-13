import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { InfoArea } from "./InfoArea";

const meta = {
  component: InfoArea,
  args: {
    header: "Resources",
    children: <p>Linked resource list goes here.</p>,
  },
} satisfies Meta<typeof InfoArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Resources")).toBeInTheDocument();
    await expect(
      canvas.getByText("Linked resource list goes here."),
    ).toBeInTheDocument();
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
    await expect(canvas.queryByText("Resources")).not.toBeInTheDocument();
    await expect(
      canvas.getByText("Linked resource list goes here."),
    ).toBeInTheDocument();
  },
};

// `condition={false}` short-circuits to null.
export const Hidden: Story = {
  args: {
    condition: false,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Resources")).not.toBeInTheDocument();
  },
};
