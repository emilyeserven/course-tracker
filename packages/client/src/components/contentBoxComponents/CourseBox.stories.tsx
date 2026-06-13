import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { CourseBox } from "./CourseBox";

import { TooltipProvider } from "@/components/ui/tooltip";
import { makeResource } from "@/test-utils/boxFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof CourseBox> = {
  component: CourseBox,
  args: makeResource(),
  decorators: [
    Story => (
      <RouterStub>
        <TooltipProvider>
          <div className="max-w-sm">
            <Story />
          </div>
        </TooltipProvider>
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
      await canvas.findByText("Intro to TypeScript"),
    ).toBeInTheDocument();
  },
};

export const NoProgress: Story = {
  args: makeResource({
    progressCurrent: 0,
    progressTotal: 0,
    dateExpires: "",
  }),
};
