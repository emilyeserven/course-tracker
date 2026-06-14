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

export const Freeform: Story = {
  args: {
    type: "freeform",
    id: "Stretch for 10 minutes",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByLabelText("Daily task description"),
    ).toHaveValue("Stretch for 10 minutes");
  },
};

// Prepend/append text around a resolved item name renders the actionable-sentence
// preview.
export const WithPreview: Story = {
  args: {
    type: "task",
    id: "task-1",
    prependText: "Review",
    appendText: "for 10 minutes",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Review Read a chapter for 10 minutes"),
    ).toBeInTheDocument();
  },
};

// type "" (None): the meta/notes inputs collapse to just the type select.
export const None: Story = {
  args: {
    type: "",
    id: "",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Daily task type")).toHaveValue(
      "",
    );
    await expect(
      canvas.queryByLabelText("Daily task notes"),
    ).not.toBeInTheDocument();
  },
};
