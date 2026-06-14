import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function PopoverDemo({
  defaultOpen,
}: { defaultOpen?: boolean }) {
  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>
        <p>Popover content here.</p>
      </PopoverContent>
    </Popover>
  );
}

const meta: Meta<typeof PopoverDemo> = {
  component: PopoverDemo,
};

export default meta;

type Story = StoryObj<typeof meta>;

// Closed: only the trigger is shown.
export const Closed: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Open popover",
      }),
    ).toBeInTheDocument();
  },
};

// Clicking the trigger opens content, which portals to document.body.
export const Opens: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Open popover",
    }));
    const body = within(document.body);
    await expect(
      await body.findByText("Popover content here."),
    ).toBeInTheDocument();
  },
};

// Pre-opened via defaultOpen.
export const DefaultOpen: Story = {
  args: {
    defaultOpen: true,
  },
  play: async () => {
    const body = within(document.body);
    await expect(
      await body.findByText("Popover content here."),
    ).toBeInTheDocument();
  },
};
