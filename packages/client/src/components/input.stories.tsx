import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { Input } from "./input";

const meta = {
  component: Input,
  args: {
    placeholder: "Type here...",
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByPlaceholderText("Type here..."),
    ).toBeInTheDocument();
  },
};

export const Typing: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "Hello");
    await expect(input).toHaveValue("Hello");
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toBeDisabled();
  },
};
