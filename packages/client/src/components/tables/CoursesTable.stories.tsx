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

// Low-priority columns collapse on narrow screens via `hidden <bp>:table-cell`
// (applied to the column's <th> and <td>); essential columns stay visible.
export const ResponsiveColumns: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // Essential columns are never hidden.
    await expect(await canvas.findByText("Name")).not.toHaveClass("hidden");
    // Detail columns hide below their breakpoint.
    await expect(await canvas.findByText("Provider")).toHaveClass("hidden");
    await expect(await canvas.findByText("Cost")).toHaveClass("hidden");
    await expect(await canvas.findByText("Expires")).toHaveClass("hidden");
  },
};
