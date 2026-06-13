import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

// `Tooltip` self-wraps a `TooltipProvider`, so no extra decorator is needed; the
// `open` prop drives visibility (more reliable in CI than hover timing).
function TooltipDemo({
  open,
}: { open?: boolean }) {
  return (
    <Tooltip open={open}>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipContent>Helpful hint</TooltipContent>
    </Tooltip>
  );
}

const meta = {
  component: TooltipDemo,
} satisfies Meta<typeof TooltipDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    open: false,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Hover me")).toBeInTheDocument();
    await expect(within(document.body).queryByRole("tooltip")).toBeNull();
  },
};

// Content portals to document.body, so assert there rather than canvasElement.
export const Open: Story = {
  args: {
    open: true,
  },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByRole("tooltip")).toHaveTextContent(
      "Helpful hint",
    );
  },
};
