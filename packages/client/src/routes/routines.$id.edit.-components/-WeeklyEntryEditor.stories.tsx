import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { WeeklyEntryEditor } from "./-WeeklyEntryEditor";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import {
  resourceOptions,
  taskOptions,
} from "@/test-utils/routinesFixtures";

const meta: Meta<typeof WeeklyEntryEditor> = {
  component: WeeklyEntryEditor,
  args: {
    type: "task",
    id: "task-1",
    notes: "",
    location: "",
    prependText: "",
    appendText: "",
    onChange: fn(),
    taskOptions,
    resourceOptions,
  },
  // Always renders QuickAddResourceDialog (useNavigate + useQueryClient +
  // useMutation), so both a router and a query client are required.
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const TaskEntry: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Daily task type")).toHaveValue(
      "task",
    );
    await expect(canvas.getByLabelText("Daily task notes")).toBeInTheDocument();
  },
};

export const ResourceEntry: Story = {
  args: {
    type: "resource",
    id: "resource-1",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Daily task type")).toHaveValue(
      "resource",
    );
  },
};
