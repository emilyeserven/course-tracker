import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ResourceLinksSection } from "./ResourceLinksSection";

import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof ResourceLinksSection> = {
  component: ResourceLinksSection,
  args: {
    resources: [
      {
        id: "r1",
        name: "React Fundamentals",
      },
      {
        id: "r2",
        name: "Advanced TypeScript",
      },
    ],
    resourceCount: 2,
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
        name: "React Fundamentals",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", {
        name: "Advanced TypeScript",
      }),
    ).toBeInTheDocument();
  },
};

// With no resources the InfoArea's condition is false — the section is empty.
export const Empty: Story = {
  args: {
    resources: [],
    resourceCount: 0,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Resources")).not.toBeInTheDocument();
  },
};
