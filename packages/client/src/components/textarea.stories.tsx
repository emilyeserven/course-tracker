import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { Textarea } from "./textarea";

const meta = {
  component: Textarea,
  args: {
    placeholder: "Write a note...",
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByPlaceholderText("Write a note..."),
    ).toBeInTheDocument();
  },
};

export const Typing: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "First line");
    await expect(textarea).toHaveValue("First line");
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
