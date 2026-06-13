import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fireEvent, within } from "storybook/test";

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
    // Label renders as a real text node inside the <Link>; the chevron's
    // "Open Routines menu" is an aria-label (attribute, not text), so this is
    // unambiguous and avoids resolving the trigger's composite role/name (#377).
    await expect(
      await within(canvasElement).findByText("Routines"),
    ).toBeInTheDocument();

    // The trigger wrapper renders. Query by data-slot rather than role/name —
    // the div wraps a link + a role=button span, whose composite name resolves
    // inconsistently under loaded headless Chromium.
    const trigger = canvasElement.querySelector<HTMLElement>(
      "[data-slot=\"dropdown-menu-trigger\"]",
    );
    if (!trigger) throw new Error("dropdown-menu-trigger did not render");
    await expect(trigger).toBeInTheDocument();
  },
};

export const Open: Story = {
  play: async ({
    canvasElement,
  }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      "[data-slot=\"dropdown-menu-trigger\"]",
    );
    if (!trigger) throw new Error("dropdown-menu-trigger did not render");

    // Open via hover, through the component's own state. The trigger fires
    // setOpen(true) on mouseenter; dispatch that with fireEvent.mouseOver
    // (React synthesizes onMouseEnter from mouseover) rather than
    // userEvent.hover/click — those assert hit-testable pointer events, and
    // Radix's open modal layer leaves document.body at `pointer-events: none`,
    // which the trigger inherits. fireEvent dispatches the event directly, so
    // it's immune to that and to Radix's pointerdown-toggle timing. Hover fires
    // no mouseleave, so the 400ms close timer never arms.
    fireEvent.mouseOver(trigger);

    // Content portals to document.body; DropdownNavItem uses asChild so each
    // item resolves as role=menuitem (proven-stable per DropdownNavItem.stories).
    const body = within(document.body);
    await expect(
      await body.findByRole("menuitem", {
        name: "All routines",
      }),
    ).toBeInTheDocument();
    await expect(
      await body.findByRole("menuitem", {
        name: "Tracker",
      }),
    ).toBeInTheDocument();
  },
};
