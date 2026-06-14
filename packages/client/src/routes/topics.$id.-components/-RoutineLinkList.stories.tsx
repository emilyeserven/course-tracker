import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoutineLinkList } from "./-RoutineLinkList";

import { makeRoutine } from "@/test-utils/boxFixtures";
import { routerDecorator } from "@/test-utils/storyDecorators";
import { smokeLink } from "@/test-utils/storyPlay";

const meta: Meta<typeof RoutineLinkList> = {
  component: RoutineLinkList,
  args: {
    routines: [
      makeRoutine({
        id: "routine-1",
        name: "Daily reading",
      }),
      makeRoutine({
        id: "routine-2",
        name: "Flashcards",
      }),
    ],
  },
  decorators: [routerDecorator],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeLink("Daily reading"),
};

export const Empty: Story = {
  args: {
    routines: [],
  },
};
