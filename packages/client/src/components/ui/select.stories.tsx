import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

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
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Pick a fruit")).toBeInTheDocument();
  },
};

// Open: the listbox content portals to document.body; picking fires onValueChange.
export const Open: Story = {
  args: {
    open: true,
  },
  play: async ({
    args,
  }) => {
    const body = within(document.body);
    await expect(
      await body.findByRole("option", {
        name: "Apple",
      }),
    ).toBeInTheDocument();
    await userEvent.click(await body.findByRole("option", {
      name: "Banana",
    }));
    await expect(args.onValueChange).toHaveBeenCalledWith("banana");
  },
};
