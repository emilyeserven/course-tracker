import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { OptionalSelectField } from "./OptionalSelectField";

const meta: Meta<typeof OptionalSelectField> = {
  component: OptionalSelectField,
  args: {
    label: "Difficulty (optional)",
    value: "",
    options: ["easy", "medium", "hard"],
    onValueChange: fn(),
  },
  decorators: [
    Story => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Difficulty (optional)"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("option", {
        name: "medium",
      }),
    ).toBeInTheDocument();
  },
};

export const WithValue: Story = {
  args: {
    value: "hard",
  },
};
