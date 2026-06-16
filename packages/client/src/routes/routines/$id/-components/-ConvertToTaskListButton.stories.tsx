import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConvertToTaskListButton } from "./-ConvertToTaskListButton";

import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

const meta: Meta<typeof ConvertToTaskListButton> = {
  component: ConvertToTaskListButton,
  args: {
    routineId: "routine-1",
  },
  decorators: [queryStoryDecorator()],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: smokeText("Convert to Task List"),
};
