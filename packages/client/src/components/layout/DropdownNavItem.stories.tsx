import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { DropdownNavItem } from "./DropdownNavItem";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof DropdownNavItem> = {
  component: DropdownNavItem,
  args: {
    to: "/routines",
    children: "All routines",
  },
  // A DropdownMenuItem needs its menu context, and the content must anchor to a
  // trigger — render inside an open menu with one. Content portals to
  // document.body, so assertions query there.
  decorators: [
    Story => (
      <RouterStub>
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <Story />
          </DropdownMenuContent>
        </DropdownMenu>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async () => {
    // `asChild` makes the rendered <a> a menuitem (Radix sets role), so query
    // by the menuitem role rather than link.
    const body = within(document.body);
    await expect(
      await body.findByRole("menuitem", {
        name: "All routines",
      }),
    ).toBeInTheDocument();
  },
};
