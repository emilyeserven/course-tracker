import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProviderBox } from "./ProviderBox";

import { makeProvider } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

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
  play: smokeText("Acme Learning"),
};
