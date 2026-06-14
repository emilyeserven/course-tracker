import type { Routine } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { RoutinesList } from "./-RoutinesList";

import { routerDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

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
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Morning Reading", "Weekly Review"),
};

export const Empty: Story = {
  args: {
    routines: [],
  },
  play: smokeText(/No routines yet!/i),
};
