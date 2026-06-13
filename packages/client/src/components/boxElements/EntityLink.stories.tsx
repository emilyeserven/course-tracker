import type { Meta, StoryObj } from "@storybook/react-vite";

import { within, expect } from "@storybook/test";

import { EntityLink } from "./EntityLink";

import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof EntityLink> = {
  component: EntityLink,
  args: {
    entity: "topics",
    id: 1,
    children: "React",
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", {
        name: "React",
      }),
    ).toBeInTheDocument();
  },
};
