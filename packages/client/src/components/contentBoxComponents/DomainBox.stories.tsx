import type { Meta, StoryObj } from "@storybook/react-vite";

import { DomainBox } from "./DomainBox";

import { makeDomain } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof DomainBox> = {
  component: DomainBox,
  args: makeDomain(),
  decorators: [cardStoryDecorator({
    constrained: true,
  })],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Frontend Engineering"),
};

export const Focused: Story = {
  args: {
    focused: true,
  },
  play: smokeText("Focused"),
};
