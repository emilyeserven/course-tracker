import type { Meta, StoryObj } from "@storybook/react-vite";

import { BookIcon } from "lucide-react";
import { within, expect } from "storybook/test";

import { CourseMetaItem } from "./CourseMetaItem";

const meta = {
  component: CourseMetaItem,
  args: {
    value: "12 resources",
    condition: true,
    iconNode: <BookIcon size={16} />,
  },
} satisfies Meta<typeof CourseMetaItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("12 resources")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    value: null,
    emptyText: "No cost given",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No cost given")).toBeInTheDocument();
  },
};
