import type { Meta, StoryObj } from "@storybook/react-vite";

import { LevelBadge } from "./LevelBadge";

const meta = {
  component: LevelBadge,
  args: {
    level: "low",
  },
} satisfies Meta<typeof LevelBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Low: Story = {};

export const Medium: Story = {
  args: {
    level: "medium",
  },
};

export const High: Story = {
  args: {
    level: "high",
  },
};

/** A null/undefined level renders the em-dash placeholder. */
export const None: Story = {
  args: {
    level: null,
  },
};
