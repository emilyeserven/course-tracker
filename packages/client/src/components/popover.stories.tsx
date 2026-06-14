import type { Meta, StoryObj } from "@storybook/react-vite";

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
export const Closed: Story = {};

// Clicking the trigger opens content, which portals to document.body.
export const Opens: Story = {};

// Pre-opened via defaultOpen.
export const DefaultOpen: Story = {
  args: {
    defaultOpen: true,
  },
};
