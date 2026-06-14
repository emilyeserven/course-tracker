import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { QuickAddTaskDialog } from "./QuickAddTaskDialog";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof QuickAddTaskDialog> = {
  component: QuickAddTaskDialog,
  args: {
    open: true,
    onOpenChange: fn(),
  },
  // useMutation + useNavigate → QueryStub + RouterStub.
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Dialog content portals to document.body.
export const Default: Story = {
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Add Task")).toBeInTheDocument();
    await expect(await body.findByLabelText("Name")).toBeInTheDocument();
  },
};

// Cancel closes the dialog via onOpenChange(false).
export const Cancel: Story = {
  play: async ({
    args,
  }) => {
    const body = within(document.body);
    await userEvent.click(await body.findByRole("button", {
      name: "Cancel",
    }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
