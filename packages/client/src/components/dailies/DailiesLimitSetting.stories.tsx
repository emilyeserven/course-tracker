import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DailiesLimitSetting } from "./DailiesLimitSetting";

import { SettingsProvider } from "@/context/SettingsProvider";

const meta = {
  component: DailiesLimitSetting,
  decorators: [
    Story => (
      <SettingsProvider>
        <Story />
      </SettingsProvider>
    ),
  ],
} satisfies Meta<typeof DailiesLimitSetting>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: /routine tracker settings/i,
      }),
    ).toBeInTheDocument();
  },
};
