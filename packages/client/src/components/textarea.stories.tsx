import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Textarea } from "./textarea";

import {
  playExpectDisabled,
  playTypeIntoTextbox,
} from "@/test-utils/storyPlays";

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
  play: playTypeIntoTextbox("First line"),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: playExpectDisabled("textbox"),
};
