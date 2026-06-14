import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailiesLimitSetting } from "./DailiesLimitSetting";

import { smokePlay } from "@/test-utils/storyPlay";

const meta = {
  component: DailiesLimitSetting,
} satisfies Meta<typeof DailiesLimitSetting>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokePlay([{
    role: "button",
    name: /routine tracker settings/i,
  }]),
};
