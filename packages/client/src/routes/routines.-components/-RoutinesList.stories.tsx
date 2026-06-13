import type { Routine } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { RoutinesList } from "./-RoutinesList";

import { RouterStub } from "@/test-utils/RouterStub";

const routines: Routine[] = [
  {
    id: "rt1",
    name: "Morning Reading",
    mode: "daily",
    status: "active",
    connections: [
      {
        type: "topic",
        id: "t1",
        name: "React",
      },
    ],
    completions: [],
    weekly: {},
  },
  {
    id: "rt2",
    name: "Weekly Review",
    mode: "weekly",
    status: "active",
    connections: [],
    completions: [],
    weekly: {},
  },
];

const meta: Meta<typeof RoutinesList> = {
  component: RoutinesList,
  args: {
    routines,
    resolveTodayAction: fn(() => null),
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
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
    await expect(canvas.getByText("Morning Reading")).toBeInTheDocument();
    await expect(canvas.getByText("Weekly Review")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    routines: [],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/No routines yet!/i)).toBeInTheDocument();
  },
};
