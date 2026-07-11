import type { Meta, StoryObj } from "@storybook/react-vite";

import { BookIcon, LayersIcon } from "lucide-react";

import { OverviewCardGrid } from "./OverviewCardGrid";

import { routerDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof OverviewCardGrid> = {
  component: OverviewCardGrid,
  args: {
    items: [
      {
        to: "/resources",
        title: "Resources",
        description: "Browse all resources.",
        icon: BookIcon,
      },
      {
        to: "/providers",
        title: "Providers",
        description: "Browse all providers.",
        icon: LayersIcon,
      },
    ],
  },
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Resources", "Providers"),
};
