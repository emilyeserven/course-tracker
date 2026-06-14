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
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Topics", "Domains"),
};
