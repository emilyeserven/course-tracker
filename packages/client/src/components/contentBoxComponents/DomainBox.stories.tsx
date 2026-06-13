import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DomainBox } from "./DomainBox";

import { makeDomain } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";

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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Frontend Engineering"),
    ).toBeInTheDocument();
  },
};

export const Focused: Story = {
  args: {
    focused: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Focused")).toBeInTheDocument();
  },
};
