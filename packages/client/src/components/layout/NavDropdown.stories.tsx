import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { DropdownNavItem } from "./DropdownNavItem";
import { NavDropdown } from "./NavDropdown";

import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof NavDropdown> = {
  component: NavDropdown,
  args: {
    label: "Routines",
    to: "/routines",
    children: (
      <>
        <DropdownNavItem to="/routines">All routines</DropdownNavItem>
        <DropdownNavItem to="/routines/tracker">Tracker</DropdownNavItem>
      </>
    ),
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", {
        name: "Routines",
      }),
    ).toBeInTheDocument();
  },
};

// Opening the trigger reveals the menu items, which portal to document.body.
export const Open: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", {
        name: "Open Routines menu",
      }),
    );
    const body = within(document.body);
    await expect(
      await body.findByRole("menuitem", {
        name: "All routines",
      }),
    ).toBeInTheDocument();
  },
};
