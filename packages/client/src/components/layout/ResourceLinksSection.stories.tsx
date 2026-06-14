import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ResourceLinksSection } from "./ResourceLinksSection";

import { routerDecorator } from "@/test-utils/storyDecorators";
import { smokeLink } from "@/test-utils/storyPlay";

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
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeLink("React Fundamentals", "Advanced TypeScript"),
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
