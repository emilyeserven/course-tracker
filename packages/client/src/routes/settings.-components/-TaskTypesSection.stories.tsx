import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { TaskTypesSection } from "./-TaskTypesSection";

import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeTaskType } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

function clientWith(taskTypes = [makeTaskType()]) {
  return seededQueryClient([[["taskTypes"], taskTypes]]);
}

const meta = {
  component: TaskTypesSection,
  decorators: [queryStubDecorator(clientWith)],
} satisfies Meta<typeof TaskTypesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// A saved task type with its tag chips.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: "Task Types",
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Deep work")).toBeInTheDocument();
  },
};

// The empty state prompts the user to create one.
export const Empty: Story = {
  decorators: [queryStubDecorator(() => clientWith([]))],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/no task types yet/i),
    ).toBeInTheDocument();
  },
};
