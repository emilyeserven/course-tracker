import type { Meta, StoryObj } from "@storybook/react-vite";

import { BookIcon, LayersIcon } from "lucide-react";
import { expect, within } from "storybook/test";

import { OverviewCardGrid } from "./OverviewCardGrid";

import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof OverviewCardGrid> = {
  component: OverviewCardGrid,
  args: {
    items: [
      {
        to: "/topics",
        title: "Topics",
        description: "Browse all topics.",
        icon: BookIcon,
      },
      {
        to: "/domains",
        title: "Domains",
        description: "Browse all domains.",
        icon: LayersIcon,
      },
    ],
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
    await expect(await canvas.findByText("Topics")).toBeInTheDocument();
    await expect(await canvas.findByText("Domains")).toBeInTheDocument();
  },
};
