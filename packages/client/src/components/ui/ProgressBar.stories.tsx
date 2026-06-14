import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressBar } from "./ProgressBar";

const meta = {
  component: ProgressBar,
  args: {
    progressCurrent: 3,
    progressTotal: 10,
  },
  decorators: [
    Story => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inactive: Story = {
  args: {
    progressCurrent: 2,
    progressTotal: 4,
    status: "inactive",
  },
};

export const Complete: Story = {
  args: {
    progressCurrent: 5,
    progressTotal: 5,
  },
};

// With no current progress the component renders nothing.
export const Empty: Story = {
  args: {
    progressCurrent: 0,
    progressTotal: 10,
  },
};
