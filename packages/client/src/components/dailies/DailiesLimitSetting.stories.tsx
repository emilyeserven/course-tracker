import type { Meta, StoryObj } from "@storybook/react-vite";

import { DailiesLimitSetting } from "./DailiesLimitSetting";

import { SettingsProvider } from "@/context/SettingsProvider";
import { providerStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta = {
  component: DailiesLimitSetting,
  decorators: [providerStoryDecorator(SettingsProvider)],
} satisfies Meta<typeof DailiesLimitSetting>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokePlay([{
    role: "button",
    name: /routine tracker settings/i,
  }]),
};
