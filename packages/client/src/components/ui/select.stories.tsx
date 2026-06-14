import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

function SelectDemo({
  open,
  onValueChange,
}: {
  open?: boolean;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select
      open={open}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  );
}

const meta: Meta<typeof SelectDemo> = {
  component: SelectDemo,
  args: {
    onValueChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Closed: only the trigger placeholder is shown.
export const Closed: Story = {
  args: {
    open: false,
  },
};

// Open: the listbox content portals to document.body; picking fires onValueChange.
export const Open: Story = {
  args: {
    open: true,
  },
};
