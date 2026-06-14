import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import { QuickAddMenu } from "./QuickAddMenu";

const meta: Meta<typeof QuickAddMenu> = {
  component: QuickAddMenu,
  args: {
    onSelect: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// The trigger renders inline in the canvas.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Quick Add")).toBeInTheDocument();
  },
};

// Opening the menu reveals the grouped options (portaled to document.body);
// picking one fires onSelect with that option's key.
export const Opens: Story = {
  play: async ({
    canvasElement,
    args,
  }) => {
    // Open via hover, through the component's own state — the trigger fires
    // setOpen(true) on mouseenter. Dispatch that with fireEvent.mouseOver
    // (React synthesizes onMouseEnter from mouseover) rather than
    // userEvent.hover/click: those assert hit-testable pointer events, and
    // Radix's open modal layer leaves document.body at `pointer-events: none`,
    // which the trigger inherits — making the opening click flaky. fireEvent
    // dispatches directly, so it's immune to that (see NavDropdown.stories).
    const trigger = canvasElement.querySelector<HTMLElement>(
      "[data-slot=\"dropdown-menu-trigger\"]",
    );
    if (!trigger) throw new Error("dropdown-menu-trigger did not render");
    fireEvent.mouseOver(trigger);

    // Content portals to document.body and mounts async — assert with findBy*.
    const body = within(document.body);
    await expect(await body.findByText("Send to")).toBeInTheDocument();
    await expect(await body.findByText("New record")).toBeInTheDocument();
    await userEvent.click(
      await body.findByRole("menuitem", {
        name: "Resource",
      }),
    );
    await expect(args.onSelect).toHaveBeenCalledWith("resource");
  },
};
