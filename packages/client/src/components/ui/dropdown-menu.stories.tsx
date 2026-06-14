import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function DropdownMenuDemo({
  onSelect,
}: { onSelect?: () => void }) {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onSelect}>Profile</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>
          Notifications
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const meta: Meta<typeof DropdownMenuDemo> = {
  component: DropdownMenuDemo,
};

export default meta;

type Story = StoryObj<typeof meta>;

// Content portals to document.body and mounts async — assert with findBy* there.
export const Default: Story = {};

// Activating an item fires its onSelect and closes the menu.
export const SelectsItem: Story = {
  args: {
    onSelect: fn(),
  },
};
