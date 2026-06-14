import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DailiesViewModeToggle } from "./DailiesViewModeToggle";

import { clickButtonExpectChange } from "@/test-utils/storyPlay";

const meta: Meta<typeof DailiesViewModeToggle> = {
  component: DailiesViewModeToggle,
  args: {
    onChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const TableSelected: Story = {
  args: {
    mode: "table",
  },
  play: clickButtonExpectChange("List view", "list"),
};

export const ListSelected: Story = {
  args: {
    mode: "list",
  },
  play: clickButtonExpectChange("Table view", "table"),
};
