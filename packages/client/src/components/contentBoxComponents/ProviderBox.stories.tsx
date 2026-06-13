import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ProviderBox } from "./ProviderBox";

import { makeProvider } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof ProviderBox> = {
  component: ProviderBox,
  args: makeProvider(),
  decorators: [cardStoryDecorator({
    constrained: true,
  })],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Acme Learning")).toBeInTheDocument();
  },
};
