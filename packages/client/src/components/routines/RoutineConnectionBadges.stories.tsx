import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoutineConnectionBadges } from "./RoutineConnectionBadges";

import { RouterStub } from "@/test-utils/RouterStub";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof RoutineConnectionBadges> = {
  component: RoutineConnectionBadges,
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
        <div className="flex flex-row flex-wrap items-center gap-2">
          <Story />
        </div>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const TaskConnection: Story = {
  play: smokeText("Read a chapter"),
};

export const BookmarkWithSection: Story = {
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
  play: smokeText(/Pimsleur Spanish/),
};

export const Empty: Story = {
  args: {
    connections: [],
  },
  play: smokeText("No connections"),
};
