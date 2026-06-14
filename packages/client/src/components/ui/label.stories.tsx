import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label";

const meta = {
  component: Label,
  args: {
    children: "Email address",
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
};
