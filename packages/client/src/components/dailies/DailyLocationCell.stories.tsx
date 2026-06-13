import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DailyLocationCell } from "./DailyLocationCell";

import { RouterStub } from "@/test-utils/RouterStub";

const meta = {
  component: DailyLocationCell,
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
} satisfies Meta<typeof DailyLocationCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TaskLink: Story = {
  args: {
    taskId: "task-1",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    // The link's accessible name is its visible text ("Go"); "Go to linked
    // task" is only its title attribute.
    const link = await canvas.findByRole("link", {
      name: "Go",
    });
    await expect(link).toHaveAttribute("title", "Go to linked task");
  },
};

export const ExternalUrl: Story = {
  args: {
    location: "https://example.com",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const link = await canvas.findByRole("link");
    await expect(link).toHaveAttribute("href", "https://example.com");
    await expect(link).toHaveAttribute("target", "_blank");
  },
};

export const PlainText: Story = {
  args: {
    location: "Room 101",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Room 101")).toBeInTheDocument();
  },
};
