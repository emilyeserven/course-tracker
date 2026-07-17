import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoutineConnectionsList } from "./-RoutineConnectionsList";

import { RouterStub } from "@/test-utils/RouterStub";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof RoutineConnectionsList> = {
  component: RoutineConnectionsList,
  args: {
    connections: [
      {
        type: "task",
        id: "task-1",
        name: "Read a chapter",
      },
    ],
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

export const TaskConnection: Story = {
  play: smokeText("Read a chapter", "task"),
};

export const BookmarkConnectionWithSection: Story = {
  args: {
    connections: [
      {
        type: "bookmark",
        id: "bm-1",
        name: "Pimsleur Spanish",
        url: "https://example.com/pimsleur",
        sectionLabel: "Unit 3",
      },
    ],
  },
  play: smokeText("Pimsleur Spanish", /Unit 3/),
};

export const Mixed: Story = {
  args: {
    connections: [
      {
        type: "task",
        id: "task-1",
        name: "Read a chapter",
      },
      {
        type: "bookmark",
        id: "bm-1",
        name: "Pimsleur Spanish",
        url: null,
      },
    ],
  },
  play: smokeText("Read a chapter", "Pimsleur Spanish"),
};
