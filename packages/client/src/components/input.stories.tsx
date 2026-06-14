import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Input } from "./input";

import {
  playExpectDisabled,
  playTypeIntoTextbox,
} from "@/test-utils/storyPlays";

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
  play: playTypeIntoTextbox("Hello"),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: playExpectDisabled("textbox"),
};
