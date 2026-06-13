import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { CoursesTable } from "./CoursesTable";

import { makeResources } from "@/test-utils/boxFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";

const meta: Meta<typeof CoursesTable> = {
  component: CoursesTable,
  args: {
    courses: makeResources(3),
  },
  decorators: [cardStoryDecorator({
    tooltip: true,
  })],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Course 1")).toBeInTheDocument();
    await expect(await canvas.findByText("Course 3")).toBeInTheDocument();
  },
};
