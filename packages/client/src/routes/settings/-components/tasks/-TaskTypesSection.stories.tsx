import type { Meta, StoryObj } from "@storybook/react-vite";

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
export const Default: Story = {};

// The empty state prompts the user to create one.
export const Empty: Story = {
  decorators: [queryStubDecorator(() => clientWith([]))],
};
