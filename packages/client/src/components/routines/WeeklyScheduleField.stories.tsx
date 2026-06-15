import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { weeklyToRows } from "./weekly";
import { WeeklyScheduleField } from "./WeeklyScheduleField";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import {
  moduleGroupsByResource,
  modulesByResource,
  resourceOptions,
  taskOptions,
} from "@/test-utils/routinesFixtures";

const meta: Meta<typeof WeeklyScheduleField> = {
  component: WeeklyScheduleField,
  args: {
    value: weeklyToRows(undefined),
    onChange: fn(),
    taskOptions,
    resourceOptions,
    moduleGroupsByResource: new Map(),
    modulesByResource: new Map(),
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

// Empty grid: every weekday row is blank. The seven Monday-first day labels render.
export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Monday")).toBeInTheDocument();
    await expect(canvas.getByText("Sunday")).toBeInTheDocument();
  },
};

// A populated grid: a task on Monday and a freeform entry on Friday. The type
// selects reflect the stored entries.
export const Populated: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "task",
        id: "task-1",
      },
      5: {
        type: "freeform",
        id: "Stretch for 10 minutes",
      },
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const mondayType = await canvas.findByLabelText("Monday type");
    await expect(mondayType).toHaveValue("task");
    await expect(canvas.getByLabelText("Friday type")).toHaveValue("freeform");
  },
};

// A resource entry on a resource that has a module hierarchy: the module-group
// and module narrowing selects appear. A chosen module reflects its parent group
// in the group select (the group is derived from the module).
export const WithModule: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "resource",
        id: "resource-1",
        moduleId: "module-2",
      },
    }),
    moduleGroupsByResource,
    modulesByResource,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const moduleSelect = await canvas.findByLabelText("Monday module");
    await expect(moduleSelect).toHaveValue("module-2");
    await expect(canvas.getByLabelText("Monday module group")).toHaveValue(
      "group-1",
    );
  },
};

// A resource entry narrowed to a whole group (no specific module): the module
// select is enabled and offers "Whole Group" as its empty option.
export const WholeGroup: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "resource",
        id: "resource-1",
        moduleGroupId: "group-1",
      },
    }),
    moduleGroupsByResource,
    modulesByResource,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Monday module group")).toHaveValue(
      "group-1",
    );
    const moduleSelect = canvas.getByLabelText("Monday module");
    await expect(moduleSelect).toHaveValue("");
    await expect(moduleSelect).toBeEnabled();
    await expect(within(moduleSelect).getByText("Whole Group")).toBeInTheDocument();
  },
};
