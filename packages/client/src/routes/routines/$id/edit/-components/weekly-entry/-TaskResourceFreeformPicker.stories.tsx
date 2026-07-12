import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { TaskResourceFreeformPicker } from "./-TaskResourceFreeformPicker";

const taskOptions = [
  {
    value: "t1",
    label: "Write the essay",
  },
  {
    value: "t2",
    label: "Read chapter 3",
  },
];

const meta: Meta<typeof TaskResourceFreeformPicker> = {
  component: TaskResourceFreeformPicker,
  args: {
    type: "task",
    id: "",
    itemOptions: taskOptions,
    optionsMap: new Map(taskOptions.map(o => [o.value, o.label])),
    onEmit: fn(),
    onInputValueChange: fn(),
  },
  decorators: [
    Story => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Task type: the combobox picker over the task options.
export const TaskPicker: Story = {};

// Freeform type swaps the combobox for a plain description input.
export const Freeform: Story = {
  args: {
    type: "freeform",
    id: "Stretch for 5 minutes",
    itemOptions: [],
    optionsMap: new Map(),
  },
};
