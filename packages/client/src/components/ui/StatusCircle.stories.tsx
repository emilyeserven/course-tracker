import type { Meta, StoryObj } from "@storybook/react-vite";

import { CircleCheckIcon, CircleDashedIcon } from "lucide-react";

import { StatusCircle } from "./StatusCircle";

const meta = {
  component: StatusCircle,
} satisfies Meta<typeof StatusCircle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  args: {
    circleClass: "bg-emerald-100 text-emerald-800 border-emerald-500",
    icon: <CircleCheckIcon />,
    title: "Complete",
  },
};

export const Empty: Story = {
  args: {
    circleClass:
      "border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground/60",
    icon: <CircleDashedIcon />,
    title: "No entry",
  },
};

export const Highlighted: Story = {
  args: {
    circleClass: "bg-violet-100 text-violet-800 border-violet-500",
    icon: <CircleCheckIcon />,
    highlight: true,
    size: "lg",
  },
};
