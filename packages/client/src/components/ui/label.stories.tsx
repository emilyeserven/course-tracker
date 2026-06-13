import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Label } from "./label";

const meta = {
  component: Label,
  args: {
    children: "Email address",
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Email address")).toBeInTheDocument();
  },
};

// `htmlFor` associates the label with a control so clicking it focuses the input.
export const WithControl: Story = {
  args: {
    htmlFor: "email",
  },
  render: args => (
    <div className="grid gap-1.5">
      <Label {...args} />
      <input
        id="email"
        type="email"
        className="border"
      />
    </div>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Email address")).toBeInTheDocument();
  },
};
