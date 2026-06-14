import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./textarea";

const meta = {
  component: Textarea,
  args: {
    placeholder: "Write a note...",
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Typing: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
