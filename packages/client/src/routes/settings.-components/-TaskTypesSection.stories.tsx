import type { Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { TaskTypesSection } from "./-TaskTypesSection";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeTaskType } from "@/test-utils/settingsFixtures";

function clientWith(taskTypes = [makeTaskType()]) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });
  client.setQueryData(["taskTypes"], taskTypes);
  return client;
}

const meta = {
  component: TaskTypesSection,
  decorators: [
    Story => (
      <QueryStub client={clientWith()}>
        <Story />
      </QueryStub>
    ),
  ],
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
  decorators: [
    Story => (
      <QueryStub client={clientWith([])}>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/no task types yet/i),
    ).toBeInTheDocument();
  },
};
