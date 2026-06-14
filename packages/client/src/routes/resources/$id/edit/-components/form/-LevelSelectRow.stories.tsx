import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { LevelSelectRow } from "./-LevelSelectRow";

const meta: Meta<typeof LevelSelectRow> = {
  component: LevelSelectRow,
  args: {
    label: "Ease of starting",
    value: "medium",
    onChange: fn(),
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

export const Default: Story = {};

// The unset state — the placeholder "—" option.
export const Empty: Story = {
  args: {
    value: "",
  },
};

// `changed` applies the dirty-field highlight used across the edit form.
export const Changed: Story = {
  args: {
    value: "high",
    changed: true,
  },
};
